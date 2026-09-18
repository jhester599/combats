/* =========================================================================
   POOL - reuse objects instead of making new ones
   =========================================================================
   Making and throwing away hundreds of bats makes the browser stop to tidy
   up ("garbage collection"), which shows up as a stutter on phones.

   So instead we keep dead bats in a "free" box and take one back out when a
   new bat is needed. This is the hook the whole game spawns units through,
   so pooling is already in place from day one.

   Usage:
     var pool = new Pool(function () { return new Unit(scene); });
     var u = pool.obtain();   // grab one (new one only if the box is empty)
     pool.release(u);         // put it back in the box when it dies
   ========================================================================= */

window.Pool = function (factory) {
  // factory is a function that builds one brand new item.
  this.factory = factory;

  this.active = [];   // items currently in use (the game loops over this)
  this.free = [];     // items waiting to be reused
};

/* Get an item to use. */
window.Pool.prototype.obtain = function () {
  var item = this.free.pop();

  if (!item) {
    item = this.factory();
  }

  this.active.push(item);
  return item;
};

/* Give an item back when you are done with it. */
window.Pool.prototype.release = function (item) {
  var index = this.active.indexOf(item);

  if (index === -1) {
    return;   // not ours, or already released - do nothing
  }

  this.active.splice(index, 1);
  this.free.push(item);
};

/* Handy for a debug readout: how many objects exist in total. */
window.Pool.prototype.size = function () {
  return this.active.length + this.free.length;
};
