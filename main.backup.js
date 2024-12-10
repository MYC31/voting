const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const VotingContract = require('./build/contracts/Voting.json');
const $ = require("jquery");
const app = express();
const port = 3001;
const TruffleContract = require('truffle-contract')
const fs = require('fs');
// const path = require('path');
// const BigNumber = require('bignumber.js');
// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545')); // Replace with your Ganache RPC URL

let accounts; // To store Ganache accounts list

function getRealValue(bigNumberObj) {
  let sign = bigNumberObj.s;
  let exponent = bigNumberObj.e;
  let coefficient = bigNumberObj.c[0];

  let realValue = coefficient * Math.pow(10, exponent);
  return sign === 1 ? realValue : -realValue;
}

// Get accounts from Ganache
// web3.eth.getAccounts()
//     .then(_accounts => {
//       accounts = _accounts;
//     });
// Main function to interact with Ethereum network
async function main() {
  let App = {
    web3Provider: null,
    contracts: {},
  
    init: async function () {
  
      return await App.initWeb3();
    },
  
    initWeb3: async function () {
      // Modern dapp browsers...
      // if (window.ethereum) {
      //   App.web3Provider = window.ethereum;
      //   try {
      //     // Request account access
      //     await window.ethereum.enable();
      //   } catch (error) {
      //     // User denied account access...
      //     console.error("User denied account access")
      //   }
      // }
      // // Legacy dapp browsers...
      // else if (window.web3) {
      //   App.web3Provider = window.web3.currentProvider;
      // }
      if (typeof web3 !== "undefined") {
        App.web3Provider = web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      var web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },
  
    initContract: function () {
      // $.getJSON('Voting.json', function (data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var AdoptionArtifact = VotingContract;
        App.contracts.Adoption = TruffleContract(AdoptionArtifact);
  
        // Set the provider for our contract
        App.contracts.Adoption.setProvider(App.web3Provider);
        App.contracts.Adoption.providers = App.contracts.Adoption.currentProvider
        // Use our contract to retrieve and mark the adopted pets
      // });
  
    },
  
  };
  App.init()
  // $(function () {
  //   $(window).load(function () {
  //     App.init();
  //     console.log(App.contracts.Adoption)
  //   });
  // });
  // const web3 = new Web3('http://localhost:7545'); // Change to your provider URL
  // const networkId = await web3.eth.net.getId();
  // const deployedNetwork = VotingContract.networks[networkId];
  // const contract = new web3.eth.Contract(
  //     VotingContract.abi,
  //     deployedNetwork && deployedNetwork.address
  // );
  // contract.deployed()
  // const contract = App.contract

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));



  // Register a new user and return Ethereum account address, post origin
  app.get('/registerUser', async (req, res) => {

      var adoptionInstance;

      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
        // var usernum;
        App.contracts.Adoption.deployed().then(function (instance) {
          adoptionInstance = instance;
          // Execute adopt as a transaction by sending account
          const reply = adoptionInstance.registerUser({ from: account });
          // usernum = adoptionInstance.getUserNum({ from: account });
          // return adoptionInstance.registerUser({ from: account });
          return reply;
        }).then(function() {
          res.send({ status: 'User registered successfully', address: account.address});
        }).catch(function(err) {
          res.send({status: "Error: " + err.message})
        });
      });
  });

  // app.get('/registerUser', async (req, res) => {
  //   try {
  //     const accounts = await web3.eth.getAccounts();
  //     const account = accounts[2];
  
  //     // Register the user
  //     await adoptionInstance.methods.registerUser().send({ from: account });
  
  //     // Get the user number
  //     const usernum = await adoptionInstance.methods.getUserNum().call({ from: account });
  
  //     res.send({
  //       status: 'User registered successfully',
  //       address: account,
  //       usernum: usernum.toString() // Ensure usernum is correctly formatted as a string
  //     });
  //   } catch (error) {
  //     res.send({ status: "Error: " + error.message });
  //   }
  // });
  


  // Route to serve createCampaign.html
  app.get('/createCampaign', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'createCampaign.html'));
  });

  // // Create a new campaign endpoint
  // app.get('/createCampaign', async (req, res) => {
  //     // const reward = document.getElementById("reward")
  //     // const candidacyFee = document.getElementById("candidacyFee")
  //     // const endVoteCount = document.getElementById("endVoteCount")

  //     if (!reward || !candidacyFee || !endVoteCount) {
  //         return res.status(400).send({ error: 'Missing parameters' });
  //     }

  //     // uint256 reward, uint256 candidacyFee, uint256 endVoteCount

  //     var adoptionInstance;

  //     web3.eth.getAccounts(function (error, accounts) {
  //       if (error) {
  //         console.log(error);
  //       }
  
  //       var account = accounts[0];
  //       // var usernum;
  //       App.contracts.Adoption.deployed().then(function (instance) {
  //         adoptionInstance = instance;
  //         // Execute adopt as a transaction by sending account
  //         const replay = adoptionInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: account });
  //         // usernum = adoptionInstance.getUserNum({ from: account });
  //         // return adoptionInstance.registerUser({ from: account });
  //         return replay;
  //       }).then(function() {
  //         res.send({ status: 'Campaign created successfully', address: account.address});
  //       }).catch(function(err) {
  //         res.send({status: "Error: " + err.message})
  //       });
  //     });

  // });

  app.post('/createCampaign', async (req, res) => {
    const { reward, candidacyFee, endVoteCount } = req.body;

    if (!reward || !candidacyFee || !endVoteCount) {
        return res.status(400).send({ error: 'Missing parameters' });
    }

    // console.log(reward, candidacyFee, endVoteCount);

    try {
        var account;
        // const accounts = await web3.eth.getAccounts();
        web3.eth.getAccounts(function (error, accounts) {
          if (error) {
            console.log(error);
          }
    
          account = accounts[0];
          // var usernum;

          // console.log(account);

          App.contracts.Adoption.deployed().then(function (instance) {
            var adoptionInstance = instance;
            // Execute adopt as a transaction by sending account
            // const replay = adoptionInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: account });
            const reply = adoptionInstance.createCampaign(reward, candidacyFee, endVoteCount, {
              from: accounts[0],
              // value: web3.toWei(reward+candidacyFee, "ether"),
              gas: 2000000 ,  // 加一些余量
              payable: true
            });
            // usernum = adoptionInstance.getUserNum({ from: account });
            // return adoptionInstance.registerUser({ from: account });
            return reply;
          }).then(function() {
            res.send({ status: 'Campaign created successfully', address: account.address});
          }).catch(function(err) {
            res.send({status: "Error: " + err.message})
          });
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



  // Route to serve createCampaign.html
  app.get('/closeCampaign', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'closeCampaign.html'));
  });

  // Close campaign and send reward to winner, post origin
  app.post('/closeCampaign', async (req, res) => {
    const { campaignId, } = req.body;

    if (!campaignId) {
      return res.status(400).send({ error: 'Missing parameters' });
    }

    console.log("campaignId: ", campaignId);
    console.log("/closeCampaign---------------------\n");
    
    var account;
    try {
      if (!campaignId) {
        return res.status(400).send({ error: 'Missing parameters' });
      }

      web3.eth.getAccounts(function (error, accounts) { 
        if (error) {
          console.log(error);
        }

        account = accounts[0];

        App.contracts.Adoption.deployed().then(function (instance) {
          var adoptionInstance = instance;
          // Execute adopt as a transaction by sending account
          // const replay = adoptionInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: account });
          // console.log(campaignId);
          const reply = adoptionInstance.closeCampaign(campaignId, {
            from: account,
            // value: web3.toWei(reward+candidacyFee, "ether"),
            gas: 2000000 ,  // 加一些余量
            // payable: true
          });
          // usernum = adoptionInstance.getUserNum({ from: account });
          // return adoptionInstance.registerUser({ from: account });
          return reply;
        }).then(function() {
          res.send({ status: 'Campaign closed successfully', address: account.address});
        }).catch(function(err) {
          res.send({status: "Error: " + err.message})
        });
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });


  // Vote - Show all ongoing campaigns and details page
app.get('/vote', async (req, res) => {
  try {

    web3.eth.getAccounts(async function (error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Adoption.deployed().then(async function (instance) {
        var adoptionInstance = instance;
        return await adoptionInstance.getCampaignAddress.call();
      }).then(function (campaignAddresses) {
        const campaignAddrArray = campaignAddresses[0];
        const _num = campaignAddresses[1];

        let camp_arr = []
        for (let i = 0; i < campaignAddrArray.length; i++) {
          const realval = getRealValue(campaignAddrArray[i]);
          camp_arr.push(realval);
        }
        let num = getRealValue(_num);

        console.log(camp_arr);
        console.log(num);
        console.log("vote-----------------\n");

        // 使用 camp_arr 的前 num 个数字渲染页面
        let renderedCampaigns = camp_arr.slice(0, num).map(campaignId => `
          <li><a href="/vote/campaign/${campaignId}">Campaign ${campaignId}</a></li>
        `).join('');

        res.send(`
          <h2>Ongoing Campaigns</h2>
          <ul>
          ${renderedCampaigns}
          </ul>
          <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        `);

      }).catch(function(err) {
        res.send({ status: "Error: " + err.message });
      });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



app.get('/vote/campaign/:id', async (req, res) => {
  const campaignId = req.params.id;
  console.log(campaignId);
  console.log("campaignId--------------\n");
    
  var account;
  try {
    web3.eth.getAccounts(async function (error, accounts) {
      if (!campaignId) {
        return res.status(400).send({ error: 'Missing parameters' });
      }


      App.contracts.Adoption.deployed().then(async function (instance) {
        var adoptionInstance = instance;
        return await adoptionInstance.getCampaignDetails.call(campaignId);

        // console.log(campaignDetails);
      }).then(function (campaignDetails) {
        // int reward,
        // int candidacyFee,
        // int endVoteCount,
        // int totalVotes,
        // int[] candidatesArr;
        // int candidatenum;
        const reward = getRealValue(campaignDetails[0]);
        const candidacyFee = getRealValue(campaignDetails[1]);
        const endVoteCount = getRealValue(campaignDetails[2]);
        const totalVotes = getRealValue(campaignDetails[3]);
        const _candidatesArr = campaignDetails[4];
        const candidatenum = getRealValue(campaignDetails[5]);

        let candidatesArr = []
        for (let i = 0; i < _candidatesArr.length; i++) {
          const realval = getRealValue(_candidatesArr[i]);
          candidatesArr.push(realval);
        }
        
        console.log("reward: ", reward);
        console.log("candidacyFee: ", candidacyFee);
        console.log("endVoteCount: ", endVoteCount);
        console.log("totalVotes: ", totalVotes);
        console.log("candidatesArr: ", candidatesArr);
        console.log(candidatenum);
        console.log("candidatenum: ", candidatenum);
        console.log("/vote/campaign/:id-----------------\n");

        const htmlFilePath = path.join(__dirname, 'public', 'campaignDetails.html');
        fs.readFile(htmlFilePath, 'utf8', (err, htmlData) => {
          if (err) {
            return res.status(500).send({ error: 'Error reading HTML file' });
          }

          // Insert campaign details into HTML
          // int reward,
          // int candidacyFee,
          // int endVoteCount,
          // int totalVotes,
          // int[] candidatesArr;
          // int candidatenum;
          const htmlWithData = htmlData
            .replace('<p id="reward">Reward: </p>', `<p id="reward">Reward: ${reward}</p>`)
            .replace('<p id="candidacyFee">Candidacy Fee: </p>', `<p id="candidacyFee">Candidacy Fee: ${candidacyFee}</p>`)
            .replace('<p id="endVoteCount">End Vote Count: </p>', `<p id="endVoteCount">End Vote Count: ${endVoteCount}</p>`)
            .replace('<p id="totalVotes">Total Votes: </p>', `<p id="totalVotes">Total Votes: ${totalVotes}</p>`)
            .replace('<p id="candidates">Candidates: </p>', `<p id="candidates">Candidates: ${candidatesArr.join(', ')}</p>`)
            .replace('<p id="candidatenum">Number of Candidates: </p>', `<p id="candidatenum">Number of Candidates: ${candidatenum}</p>`)
            .replace('</body>', `<script>window.campaignId = ${campaignId};</script></body>`);

          res.send(htmlWithData);
        });

      }).catch(function(err) {
        res.send({ status: "Error: " + err.message });
      });
    });
  } catch (error) {
  res.status(500).send({ error: error.message });
}
});



// Handle voting
app.post('/voting', async (req, res) => {
  const { campaignId, candidateId, account, } = req.body;

  if (!campaignId || !candidateId || !account) {
    return res.status(400).send({ error: 'Missing parameters' });
  }

  console.log("campaignId: ", campaignId);
  console.log("candidateId: ", candidateId);
  console.log("account: ", account);
  console.log("/voting---------------------\n");

  web3.eth.getAccounts(function (error, accounts) {
    if (error) {
      console.log(error);
    }

    // var account = accounts[0];
    // var account = accounts[1];
    // var usernum;
    App.contracts.Adoption.deployed().then(function (instance) {
      var adoptionInstance = instance;
      // Execute adopt as a transaction by sending account
      const reply = adoptionInstance.vote(campaignId, candidateId, {
            from: account,
            // value: web3.utils.toWei('1', 'ether'), // Assuming the voting fee is 1 ETH
            gas: 2000000
          });
      return reply;
    }).then(function() {
      res.send({ status: 'Vote casted successfully', address: account.address,
                campaignId: campaignId, candidateId: candidateId });
    }).catch(function(err) {
      res.send({status: "Error: " + err.message})
    });
  });
});



// Handle declaring candidacy
app.post('/declareCandidacy', async (req, res) => {
  const { campaignId } = req.body;

  if (!campaignId) {
    return res.status(400).send({ error: 'Missing parameters' });
  }

  web3.eth.getAccounts(function (error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];
    // var usernum;
    App.contracts.Adoption.deployed().then(function (instance) {
      var adoptionInstance = instance;
      // Execute adopt as a transaction by sending account
      const reply = adoptionInstance.declareCandidacy(campaignId, {
            from: account,
            // value: web3.utils.toWei('0.1', 'ether'), // Assuming the candidacy fee is 0.1 ETH
            gas: 2000000
          });
      return reply;
    }).then(function() {
      res.send({ status: 'Candidacy declared successfully', address: account.address,
                campaignId: campaignId });
    }).catch(function(err) {
      res.send({status: "Error: " + err.message})
    });
  });
});



  // Main page with navigation buttons
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });


  // Start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch(error => console.error('Error in main function:', error));


