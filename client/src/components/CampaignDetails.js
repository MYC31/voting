import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import VotingContract from '../contracts/Voting.json';

const CampaignDetails = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null); // Initialize with null or {}
    const [account, setAccount] = useState('');
    const [isCandidate, setIsCandidate] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            try {
                const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
                const accounts = await web3.eth.requestAccounts();
                const currentAccount = accounts[0];
                setAccount(currentAccount);

                const networkId = await web3.eth.net.getId();
                const deployedNetwork = VotingContract.networks[networkId];
                const contract = new web3.eth.Contract(VotingContract.abi, deployedNetwork && deployedNetwork.address);

                const fetchedCampaign = await contract.methods.campaigns(id).call();
                setCampaign(fetchedCampaign);

                const isCandidateResult = await contract.methods.candidates(currentAccount).call();
                setIsCandidate(isCandidateResult);

                const hasVotedResult = await contract.methods.hasVoted(currentAccount).call();
                setHasVoted(hasVotedResult);
            } catch (error) {
                console.error('Error fetching campaign details:', error);
            }
        };

        if (id) {
            fetchCampaignDetails();
        }
    }, [id]);

    const handleCandidacy = async () => {
        try {
            const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = VotingContract.networks[networkId];
            const contract = new web3.eth.Contract(VotingContract.abi, deployedNetwork && deployedNetwork.address);

            await contract.methods.declareCandidacy(id).send({ from: account, value: web3.utils.toWei(campaign.candidacyFee.toString(), 'ether') });
        } catch (error) {
            console.error('Error declaring candidacy:', error);
        }
    };

    const handleVote = async (candidate) => {
        try {
            const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = VotingContract.networks[networkId];
            const contract = new web3.eth.Contract(VotingContract.abi, deployedNetwork && deployedNetwork.address);

            await contract.methods.vote(id, candidate).send({ from: account, value: web3.utils.toWei('1', 'ether') });
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    if (!campaign) {
        return <p>Loading campaign details...</p>;
    }

    return (
        <div>
            <h2>Campaign Details</h2>
            <p>Creator: {campaign.creator}</p>
            <p>Reward: {campaign.reward} wei</p>
            <p>End Vote Count: {campaign.endVoteCount}</p>
            <p>Ended: {campaign.ended ? 'Yes' : 'No'}</p>
            {campaign.ended && <p>Winner: {campaign.winner}</p>}

            {!campaign.ended && (
                <div>
                    {!isCandidate && !hasVoted && <button onClick={handleCandidacy}>Become Candidate</button>}
                    <h3>Candidates:</h3>
                    <ul>
                        {campaign.candidatesList.map(candidate => (
                            <li key={candidate}>
                                <p>Address: {candidate}</p>
                                <p>Votes: {campaign.votes[candidate]}</p>
                                {!hasVoted && <button onClick={() => handleVote(candidate)}>Vote</button>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CampaignDetails;
