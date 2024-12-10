// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Campaign {
        address creator;
        int reward;
        int candidacyFee;
        int endVoteCount;
        bool ended;
        address winner;
        int totalVotes;
        address[] candidatesList;
        int candidatenum;
        mapping(address => bool) candidates;
        mapping(address => int) votes;
        mapping(address => bool) hasVoted;
    }

    struct Vote {
        address candidate;
        int votenum;
    }

    struct CampaignData {
        address creator;
        int reward;
        int candidacyFee;
        int endVoteCount;
        int totalVotes;
        Vote[] candvotes;
    }

    struct User {
        address userAddress;
        bool isRegistered;
    }

    mapping(int => Campaign) public campaigns;
    int usernum = 0;
    mapping(address => User) public users;
    int public campaignCount = 0;
    int public candidates_max = 100;
    int public candidacyfee = 1;


    function createCampaignCheck() internal view {
        require(users[msg.sender].isRegistered, "User must be registered");
    }

    // Function to create a new campaign
    function createCampaign(int reward, int candidacyFee, int endVoteCount) public payable {
        // require(msg.value == reward + candidacyFee, "Reward and candidacy fee must be transferred to the contract");
        createCampaignCheck();

        Campaign storage newCampaign = campaigns[campaignCount];
        campaignCount++;
        newCampaign.creator = msg.sender;
        newCampaign.reward = reward;
        newCampaign.candidacyFee = candidacyFee;
        newCampaign.endVoteCount = endVoteCount;
        newCampaign.ended = false;
        newCampaign.totalVotes = 0;
        newCampaign.candidatenum = 0;
        newCampaign.candidatesList = new address[](uint256(candidates_max));
    }

    function declareCandidacyCheck(int campaignId) internal view {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.ended, "You cannot join an closed campaign!");
        require(!campaign.hasVoted[msg.sender], "Voter cannot become a candidate");
        require(campaign.candidatenum < candidates_max, "Candidate num has reached max!");
        require(users[msg.sender].isRegistered, "User must have been registered");
        require(!campaign.candidates[msg.sender], "Campaign cannot be declared more than twice!");
    }

    function updateCampaignAfterCandidacy(int campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        campaign.candidates[msg.sender] = true;
        campaign.votes[msg.sender] = 1;
        campaign.totalVotes ++;
        campaign.candidatesList[uint256(campaign.candidatenum)] = msg.sender;
        campaign.candidatenum ++;
    }

    function declareCandidacy(int campaignId) public payable {
        Campaign storage campaign = campaigns[campaignId];
        declareCandidacyCheck(campaignId);
        updateCampaignAfterCandidacy(campaignId);
        payable(campaign.creator).transfer(msg.value);
    }

    function voteCheck(int campaignId, int candidate) internal view {
        Campaign storage campaign = campaigns[campaignId];
        address candaddr = campaign.candidatesList[uint256(candidate)];
        require(!campaign.ended, "Campaign has ended");
        require(campaign.candidates[candaddr], "Invalid candidate");
        require(!campaign.hasVoted[msg.sender], "Voter has already voted");
    }

    function handleClosedCampaign(int campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.totalVotes >= campaign.endVoteCount) {
            campaign.ended = true;
            campaign.winner = findWinner(campaignId);
        }
    }

    function vote(int campaignId, int candidate) public payable {
        Campaign storage campaign = campaigns[campaignId];
        address candaddr = campaign.candidatesList[uint256(candidate)];
        voteCheck(campaignId, candidate);

        campaign.votes[candaddr]++;
        campaign.hasVoted[msg.sender] = true;
        campaign.totalVotes++;

        handleClosedCampaign(campaignId);
    }

    function closeCamopaignCheck(int campaignId) internal view {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.creator == msg.sender, "Only the campaign creator can close the campaign");
        require(campaign.ended == true, "Campaign must have been ended to close");
        require(campaign.winner != address(0), "Winner address is invalid!");
        uint256 rewardAmount = uint256(campaign.reward);
        rewardAmount = rewardAmount / 10;
        require(address(this).balance >= rewardAmount, "Not enough balance in the contract to transfer reward");
    }

    function closeCampaign(int campaignId) public payable {
        Campaign storage campaign = campaigns[campaignId];
        closeCamopaignCheck(campaignId);
        payable(campaign.winner).transfer(msg.value);
        campaign.reward = 0; 
        campaign.ended = true;
    }

    function findWinner(int campaignId) internal view returns (address) {
        Campaign storage campaign = campaigns[campaignId];
        address winner = campaign.candidatesList[0];
        int highestVotes = campaign.votes[winner];

        for (int i = 1; i < int(campaign.candidatenum); i++) {
            address candidate = campaign.candidatesList[uint256(i)];
            if (campaign.votes[candidate] > highestVotes) {
                highestVotes = campaign.votes[candidate];
                winner = candidate;
            }
        }
        return winner;
    }

    function getCampaignDetails(int campaignId) public view returns (
        int reward,
        int candidacyFee,
        int endVoteCount,
        int totalVotes,
        int[] memory candidatesArr,
        int candidatenum
    ) {
        Campaign storage campaign = campaigns[campaignId];
        int[] memory _candidatesArr = new int[](uint256(campaign.candidatenum));
        for (uint i = 0; i < _candidatesArr.length; i++) {
            _candidatesArr[i] = int(i);
        }
        return (
            campaign.reward,
            campaign.candidacyFee,
            campaign.endVoteCount,
            campaign.totalVotes,
            _candidatesArr,
            campaign.candidatenum
        );
    }

    
    function getCampaignAddress() public view returns (int[] memory campaignAddr, int num) {
        int[] memory __campaignAddr = new int[](uint256(campaignCount));
        int i;
        int _num = 0;
        for (i = 0; i < campaignCount; i++) {
            if (campaigns[i].ended == false) {
                __campaignAddr[uint256(_num)] = i;
                _num ++;
            }
        }
        return (__campaignAddr, _num);
    }

    function getUserNum() public view returns (int _usernum) {
        return usernum;
    }

    function registerUser() public {
        require(!users[msg.sender].isRegistered, "User is already registered");
        User storage user = users[msg.sender];
        user.isRegistered = true;
        user.userAddress = msg.sender;
        usernum++;
    }
}
