// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/// @title IMEP-802 Provisioning Contract
/* is IERC721 */
interface IMEP802 {
    /// @dev This event gets emitted when the Provisioning contract is deployed.
    ///  The parameters is the address of the contract deployed
    event MEP802Deployed(address indexed _address);

    /// @dev This event gets emitted when a PID is produced.
    ///  The parameters are the email, amount and Application contract address.
    event PIDProduced(string indexed _email, uint256 indexed _amount, address indexed _lpwanContractAddress);

    /// @dev This event gets emitted when a PID is produced.
    ///  The parameters are tokenID, and pIDHash
    event SensorNFTMinted(uint256 indexed _tokenID, bytes32 indexed _pIDHash);

    /// @dev This event gets emitted when a sensor NFT is claimed.
    ///  The parameters are tokenID, _pIDHash, and address of the claimer
    event SensorNFTClaimed(uint256 indexed tokenId, bytes32 indexed _pIDHash, address indexed claimer);

    /// @dev This event gets emitted when a sensor NFT is renewed.
    ///  The parameters are tokenID, amount paid, and address of the renewer
    event SensorNFTRenewed(uint256 indexed tokenId, uint256 indexed amount, address indexed renewer);

    /// @notice Produce the PID, the PID will be sent to the email given
    /// @param _email The email to receive the PID
    /// @param _amount The amount of the PID
    /// @param _lpwanContractAddress The contract address of the application
    function producePID(string memory _email, uint256 _amount, address _lpwanContractAddress) external;

    /// @notice Mint a sensor NFT
    /// @dev The tokenID should be generated on-chain
    /// @param _pIDHash The hash of the PID
    /// @param _tokenURI The uri that will be associated with the token
    function mintSensorNFT(bytes32 _pIDHash, string memory _tokenURI) external payable;

    /// @notice Renews the validity of the device
    /// @dev This method extends the validity period of the sensor.
    ///  This method takes in the pIDHashEVM (depends on which hash function chain is using), then match the NFT with the pIDHashEVM.
    ///  This method will check whether the user who calls this renew function is the owner of the NFT
    ///  This method will check whether the user has enough balance to finish this operation
    ///  For more info check the rationale.
    /// @param _pIDHashEVM the pID EVM Hash gotten from pID
    function renewPID(bytes32 _pIDHashEVM) external payable;

    /// @notice Claims an NFT by transferring it to the caller
    /// @dev This method calculates the hash of the _pid
    ///  and checks if it's the same on the NFT.
    ///  If correct, the NFT gets transferred to the caller.
    ///  This method starts the validity period of the sensor.
    /// @param _pID the PID of the sensor to be claimed
    function claimSensorNFT(bytes32 _pID) external payable;

    /// @notice Checks whether the sensor validity period expired
    /// @param _tokenId The identifier of the NFT
    /// @return True if the expiration period is greater than
    ///  the current height
    function isValid(uint256 _tokenId) external view returns (bool);
}
