import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import TruffleContract from '@truffle/contract';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AllCampaigns from './components/AllCampaigns';
import CampaignDetails from './components/CampaignDetails';

const App = () => {
    const [web3, setWeb3] = useState(null);
    const [adoptionContract, setAdoptionContract] = useState(null);

    useEffect(() => {
        const initWeb3 = async () => {
            let web3Provider;

            if (typeof window.ethereum !== 'undefined') {
                web3Provider = window.ethereum;
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (error) {
                    console.error("User denied account access");
                }
            } else if (typeof window.web3 !== 'undefined') {
                web3Provider = window.web3.currentProvider;
            } else {
                web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            }

            const web3Instance = new Web3(web3Provider);
            setWeb3(web3Instance);

            const adoptionArtifact = await fetch('/Voting.json').then(response => response.json());
            const Adoption = TruffleContract(adoptionArtifact);
            Adoption.setProvider(web3Instance.currentProvider);

            setAdoptionContract(Adoption);
        };

        initWeb3();
    }, []);

    useEffect(() => {
        const initContract = async () => {
            if (adoptionContract) {
                const instance = await adoptionContract.deployed();
                console.log("Contract instance:", instance);
                // You can now use the instance to interact with the smart contract
                // Example: await instance.adopt(1, { from: accounts[0] });
            }
        };

        initContract();
    }, [adoptionContract]);

    return (
        <Router>
            <Switch>
                <Route path="/" exact component={AllCampaigns} />
                <Route path="/campaign/:id" component={CampaignDetails} />
            </Switch>
        </Router>
    );
};

export default App;

