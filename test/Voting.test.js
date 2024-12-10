const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  let votingInstance;

  beforeEach(async () => {
    votingInstance = await Voting.new();
  });

  it("should create a new campaign", async () => {
    const reward = web3.utils.toWei("1", "ether");
    const candidacyFee = web3.utils.toWei("0.1", "ether");
    const endVoteCount = 5;

    await votingInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: accounts[0], value: reward });
    const campaign = await votingInstance.campaigns(1);

    assert.equal(campaign.creator, accounts[0], "Creator address is incorrect");
    assert.equal(campaign.reward, reward, "Reward is incorrect");
    assert.equal(campaign.candidacyFee, candidacyFee, "Candidacy fee is incorrect");
    assert.equal(campaign.endVoteCount, endVoteCount, "End vote count is incorrect");
  });

  it("should allow a user to declare candidacy", async () => {
    const reward = web3.utils.toWei("1", "ether");
    const candidacyFee = web3.utils.toWei("0.1", "ether");
    const endVoteCount = 5;

    await votingInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: accounts[0], value: reward });
    await votingInstance.declareCandidacy(1, { from: accounts[1], value: candidacyFee });

    const campaign = await votingInstance.campaigns(1);
    const isCandidate = await campaign.candidates(accounts[1]);

    assert.equal(isCandidate, true, "Candidate was not correctly added");
  });

  it("should allow a user to vote and end campaign when votes reach endVoteCount", async () => {
    const reward = web3.utils.toWei("1", "ether");
    const candidacyFee = web3.utils.toWei("0.1", "ether");
    const endVoteCount = 2;

    await votingInstance.createCampaign(reward, candidacyFee, endVoteCount, { from: accounts[0], value: reward });
    await votingInstance.declareCandidacy(1, { from: accounts[1], value: candidacyFee });
    await votingInstance.declareCandidacy(1, { from: accounts[2], value: candidacyFee });

    await votingInstance.vote(1, accounts[1], { from: accounts[3], value: web3.utils.toWei("1", "ether") });
    await votingInstance.vote(1, accounts[1], { from: accounts[4], value: web3.utils.toWei("1", "ether") });

    const campaign = await votingInstance.campaigns(1);
    const votesForCandidate = await campaign.votes(accounts[1]);
    const isEnded = await campaign.ended;
    const winner = await campaign.winner;

    assert.equal(votesForCandidate.toNumber(), 2, "Candidate did not receive correct number of votes");
    assert.equal(isEnded, true, "Campaign did not end when it should have");
    assert.equal(winner, accounts[1], "Winner was not correctly set");
  });
});
