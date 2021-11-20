const Trackr = artifacts.require("Trackr");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(Trackr);
};