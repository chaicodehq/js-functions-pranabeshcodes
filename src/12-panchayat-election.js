/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // Your code here
  if (!Array.isArray(candidates)) candidates = [];

  const candidateMap = new Map();
  candidates.forEach(c => candidateMap.set(c.id, c));

  const votes = {};               // candidateId -> count
  const registered = new Map();   // voterId -> voter
  const voted = new Set();        // voterIds who voted

  return {
    registerVoter(voter) {
      if (
        !voter ||
        typeof voter.id !== "string" ||
        typeof voter.name !== "string" ||
        typeof voter.age !== "number"
      ) {
        return false;
      }

      if (voter.age < 18) return false;
      if (registered.has(voter.id)) return false;

      registered.set(voter.id, voter);
      return true;
    },

    castVote(voterId, candidateId, onSuccess, onError) {
      const fail = (msg) =>
        typeof onError === "function" ? onError(msg) : undefined;

      if (!registered.has(voterId)) return fail("voter not registered");
      if (!candidateMap.has(candidateId)) return fail("candidate not found");
      if (voted.has(voterId)) return fail("already voted");

      votes[candidateId] = (votes[candidateId] || 0) + 1;
      voted.add(voterId);

      if (typeof onSuccess === "function") {
        return onSuccess({ voterId, candidateId });
      }
    },

    getResults(sortFn) {
      const results = candidates.map(c => ({
        id: c.id,
        name: c.name,
        party: c.party,
        votes: votes[c.id] || 0
      }));

      if (typeof sortFn === "function") {
        return [...results].sort(sortFn);
      }

      return [...results].sort((a, b) => b.votes - a.votes);
    },

    getWinner() {
      let winner = null;
      let maxVotes = 0;

      for (const c of candidates) {
        const count = votes[c.id] || 0;

        if (count > maxVotes) {
          maxVotes = count;
          winner = { ...c };
        }
      }

      return maxVotes === 0 ? null : winner;
    }
  };
}

export function createVoteValidator(rules) {
  // Your code here
  const { minAge = 18, requiredFields = [] } = rules || {};

  return (voter) => {
    if (!voter || typeof voter !== "object") {
      return { valid: false, reason: "invalid voter" };
    }

    for (const field of requiredFields) {
      if (!(field in voter)) {
        return { valid: false, reason: `missing ${field}` };
      }
    }

    if (typeof voter.age !== "number" || voter.age < minAge) {
      return { valid: false, reason: "age below minimum" };
    }

    return { valid: true };
  };
}

export function countVotesInRegions(regionTree) {
  // Your code here
  if (!regionTree || typeof regionTree !== "object") return 0;

  const ownVotes =
    typeof regionTree.votes === "number" ? regionTree.votes : 0;

  const subs = Array.isArray(regionTree.subRegions)
    ? regionTree.subRegions
    : [];

  return ownVotes + subs.reduce((sum, r) => sum + countVotesInRegions(r), 0);
}

export function tallyPure(currentTally, candidateId) {
  // Your code here
  const tally = currentTally && typeof currentTally === "object"
    ? currentTally
    : {};

  const newCount = (tally[candidateId] || 0) + 1;

  return {
    ...tally,
    [candidateId]: newCount
  };
}
