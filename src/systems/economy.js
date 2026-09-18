/* =========================================================================
   ECONOMY - the energy you spend on bats
   =========================================================================
   Energy trickles in over time. Deploying a unit spends some.

   This file contains NO numbers of its own on purpose - it is handed the
   starting energy, the refill rate and the cap by the level (data/levels.js).
   ========================================================================= */

window.Economy = function (startEnergy, energyPerSecond, maxEnergy) {
  this.energy = startEnergy;
  this.energyPerSecond = energyPerSecond;
  this.maxEnergy = maxEnergy;
};

/* Called once per simulation step. dt is a small slice of a second. */
window.Economy.prototype.update = function (dt) {
  this.energy += this.energyPerSecond * dt;

  if (this.energy > this.maxEnergy) {
    this.energy = this.maxEnergy;
  }
};

/* Can we pay this price right now? */
window.Economy.prototype.canAfford = function (cost) {
  return this.energy >= cost;
};

/* Try to pay. Returns true if the money left our pocket. */
window.Economy.prototype.spend = function (cost) {
  if (!this.canAfford(cost)) {
    return false;
  }

  this.energy -= cost;
  return true;
};

/* How full the energy bar should be drawn, from 0 to 1. */
window.Economy.prototype.fillRatio = function () {
  return this.energy / this.maxEnergy;
};
