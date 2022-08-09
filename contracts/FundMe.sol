// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// When following the Solidity style guide, errors should be directly after the imports
// section. i.e. This is not included in the official documentation.
error FundMe__NotOwner();

// NatSpec is useful for autogenerating docx.
/**@title A contract for crowd funding
 * @author Patrick Collins
 * @notice _______
 */
contract FundMe {
    using PriceConverter for uint256;

    // We use the 's_.....' naming convention to signal where the variable is going to be
    // stored.

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    // When we use the same contract on different chains, the data feeds will all be different.
    // To account for this, we'll modularise the contract by allowing it to create different
    // interfaces for each chain it's deployed on.

    // First we create the variable:
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Then we pass the address of the chain's data aggregator in the constructor so that it
    // pulls from the correct source.
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // This withdraw function is computationally expensive. The SSTORE (~20,000) and SLOAD (~8,000) opcodes are
    // some of the most expensive computations that can be performed in a transaction.abi

    // In this particular transaction, we complete computations involving these opcodes multiple times.
    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // Instead of storing/reading the array in Storage, we can opt to do so in Memory.
        address[] memory funders = s_funders;

        // mappings can't be stored in memory.

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "ETH not sent.");
    }

    // Variables don't all need to be set as public, some can be set as private. When doing so, you then
    // have to create corresponding getter functions that allow you to retrieve all that information.
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
