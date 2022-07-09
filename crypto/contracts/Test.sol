//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract Test is Initializable, OwnableUpgradeable, ERC721EnumerableUpgradeable {

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;
    uint256 public bundleFee;


    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }


    function __TestNFT_init(string memory name_, string memory symbol_) public initializer {
        __Ownable_init();
        __ERC721_init(name_, symbol_);
    }

    event MintMessage(uint256 message);

    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        // todo: revert if this is not called within `bundle`
        return this.onERC721Received.selector;
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function setBundleFee(uint256 _fee) public onlyOwner {
        bundleFee = _fee;
    }

    /**
     * @dev Withdraw all fees to the owner address
     */
    function withdrawFees() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

     function mintItem(address to, string memory uri) public payable returns(uint256) {
      uint256 tokenId = uint256(keccak256(abi.encodePacked(uri, block.timestamp)));
      _safeMint(to, tokenId);
      emit MintMessage(tokenId);
      _setTokenURI(tokenId, uri);
      return tokenId;
    }
}
