// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateAuthority {
    struct Certificate {
        uint256 studentId;
        uint256 institutionId;
        string certificateId;
        string ipfsHash;
        string sha256Hash;
        string signature;
        string encryptedAesKeyForMetadata;
        uint256 issueTimestamp;
    }

    mapping(string => Certificate) public certificates;
    address public contractOwner;

    event CertificateIssued(string certificateId, uint256 studentId, uint256 institutionId, address issuerAddress);

    constructor() {
        contractOwner = msg.sender;
    }

    function issueCertificate(
        string memory _certificateId,
        uint256 _studentId,
        uint256 _institutionId,
        string memory _ipfsHash,
        string memory _sha256Hash,
        string memory _signature,
        string memory _encryptedAesKeyForMetadata
    ) public {
        require(certificates[_certificateId].institutionId == 0, "Certificate ID already exists"); // Ensure unique ID

        certificates[_certificateId] = Certificate({
            studentId: _studentId,
            institutionId: _institutionId,
            certificateId: _certificateId,
            ipfsHash: _ipfsHash,
            sha256Hash: _sha256Hash,
            signature: _signature,
            encryptedAesKeyForMetadata: _encryptedAesKeyForMetadata,
            issueTimestamp: block.timestamp
        });

        emit CertificateIssued(_certificateId, _studentId, _institutionId, msg.sender);
    }

    function getCertificateDetails(string memory _certificateId) public view returns (
        uint256 studentId,
        uint256 institutionId,
        string memory ipfsHash,
        string memory sha256Hash,
        string memory signature,
        string memory encryptedAesKeyForMetadata,
        uint256 issueTimestamp
    ) {
        Certificate storage cert = certificates[_certificateId];
        require(cert.institutionId != 0, "Certificate not found");

        return (
            cert.studentId,
            cert.institutionId,
            cert.ipfsHash,
            cert.sha256Hash,
            cert.signature,
            cert.encryptedAesKeyForMetadata,
            cert.issueTimestamp
        );
    }
}
