// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    address public buyer;
    address public seller;
    address public developer;
    uint256 public amount;
    bool public isCompleted;

    event FundsReleased(address to, uint256 amount);
    event TransactionCancelled(address to, uint256 amount);

    // Modifier untuk membatasi akses hanya untuk Buyer
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Hanya Buyer yang bisa melakukan ini");
        _;
    }

    // Modifier untuk membatasi akses hanya untuk Developer
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Hanya Developer yang bisa melakukan ini");
        _;
    }

    constructor(address _seller, address _developer) payable {
        require(msg.value > 0, "Harus mengirimkan dana untuk memulai Escrow");
        buyer = msg.sender;
        seller = _seller;
        developer = _developer;
        amount = msg.value;
        isCompleted = false;
    }

    // Fungsi bagi Buyer untuk melepaskan dana ke Seller
    function releaseFunds() external onlyBuyer {
        require(!isCompleted, "Transaksi sudah selesai");
        
        isCompleted = true;
        uint256 fee = (amount * 1) / 100; // Contoh fee 1% untuk developer
        uint256 payment = amount - fee;

        payable(seller).transfer(payment);
        payable(developer).transfer(fee);

        emit FundsReleased(seller, payment);
    }

    // Fungsi bagi Developer untuk mengembalikan dana jika terjadi sengketa
    function refundBuyer() external onlyDeveloper {
        require(!isCompleted, "Transaksi sudah selesai");
        
        isCompleted = true;
        payable(buyer).transfer(amount);

        emit TransactionCancelled(buyer, amount);
    }

    // Fungsi untuk mengecek saldo kontrak
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}