import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import VotingContract from '../contracts/Voting.json';

const AllCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = VotingContract.networks[networkId];
            const contract = new web3.eth.Contract(VotingContract.abi, deployedNetwork && deployedNetwork.address);
            const campaignCount = await contract.methods.campaignCount().call();
            const fetchedCampaigns = [];

            for (let i = 1; i <= campaignCount; i++) {
                const campaign = await contract.methods.campaigns(i).call();
                fetchedCampaigns.push({ id: i, ...campaign });
            }
            setCampaigns(fetchedCampaigns);
        };

        fetchCampaigns();
    }, []);

    return (
        <div>
            <h2>All Campaigns</h2>
            <ul>
                {campaigns.map(campaign => (
                    <li key={campaign.id}>
                        <Link to={`/campaign/${campaign.id}`}>Campaign {campaign.id}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllCampaigns;
