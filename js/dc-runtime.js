/* Mini moteur de rendu des fichiers .dc.html (holes {{...}}, sc-if, sc-for, évènements on*).
   Ne pas modifier sans raison : voir CLAUDE.md, section "Comment la page fonctionne". */
(function () {
  'use strict';
  var EVENTS = {
    onclick: 'click', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave',
    onfocus: 'focus', onblur: 'blur', onpointerdown: 'pointerdown',
    onpointermove: 'pointermove', onpointerup: 'pointerup',
    onpointercancel: 'pointercancel', ondoubleclick: 'dblclick',
    ontouchstart: 'touchstart', ontouchmove: 'touchmove', ontouchend: 'touchend', ontouchcancel: 'touchcancel', oninput: 'input', onkeydown: 'keydown', onchange: 'change'
  };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function lookup(scope, path) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(tpl, scope, esc) {
    return tpl.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      v = v == null ? '' : String(v);
      return esc ? v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') : v;
    });
  }
  function single(tpl) {
    var m = tpl.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
    return m ? m[1] : null;
  }

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (p) {
    var next = typeof p === 'function' ? p(this.state || {}) : p;
    this.state = Object.assign({}, this.state || {}, next);
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  var comp, vals = {}, binds = [], texts = [], ifs = [], fors = [], pending = false;

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; render(); });
  }

  function compile(root) {
    Array.prototype.slice.call(root.querySelectorAll('sc-for')).forEach(function (node) {
      fors.push({ el: node, list: single(node.getAttribute('list')), as: node.getAttribute('as') || 'item', tpl: node.innerHTML, last: null });
      node.innerHTML = '';
      node.style.display = 'contents';
    });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        if (node.nodeValue.indexOf('{{') >= 0) texts.push({ node: node, tpl: node.nodeValue });
        return;
      }
      var tag = node.tagName.toLowerCase();
      if (tag === 'sc-if') {
        ifs.push({ el: node, path: single(node.getAttribute('value')) });
        node.style.display = 'contents';
      }
      Array.prototype.slice.call(node.attributes).forEach(function (a) {
        var name = a.name, val = a.value;
        if (name.indexOf('hint-') === 0) { node.removeAttribute(name); return; }
        if (tag === 'sc-for' || tag === 'sc-if') return;
        if (EVENTS[name]) {
          var path = single(val);
          node.removeAttribute(name);
          node.addEventListener(EVENTS[name], function (e) {
            var fn = lookup(vals, path);
            if (typeof fn === 'function') fn(e);
          });
          return;
        }
        if (name === 'ref') {
          var rp = single(val);
          node.removeAttribute('ref');
          var fn = lookup(vals, rp);
          if (typeof fn === 'function') fn(node);
          return;
        }
        if (val.indexOf('{{') >= 0) binds.push({ el: node, name: name, tpl: val });
      });
    });
  }

  function render() {
    vals = comp.renderVals();
    binds.forEach(function (b) {
      var v = interp(b.tpl, vals, false);
      if (b.el.getAttribute(b.name) !== v) b.el.setAttribute(b.name, v);
    });
    texts.forEach(function (t) {
      var v = interp(t.tpl, vals, false);
      if (t.node.nodeValue !== v) t.node.nodeValue = v;
    });
    ifs.forEach(function (i) {
      var show = !!lookup(vals, i.path);
      var d = show ? 'contents' : 'none';
      if (i.el.style.display !== d) i.el.style.display = d;
    });
    fors.forEach(function (f) {
      var list = lookup(vals, f.list) || [];
      var html = list.map(function (item, idx) {
        var scope = Object.assign({}, vals);
        scope[f.as] = item;
        scope.$index = idx;
        return interp(f.tpl, scope, true);
      }).join('');
      if (html !== f.last) { f.el.innerHTML = html; f.last = html; }
    });
  }

  window.__mountDC = function (Component, props) {
    var root = document.getElementById('app');
    comp = new Component(props);
    comp.state = comp.state || {};
    vals = comp.renderVals();
    compile(root);
    render();
    if (typeof comp.componentDidMount === 'function') comp.componentDidMount();
  };
})();
