// jshint esversion:6

// var jsnx = require('jsnetworkx');
// var jsnx =
// 1) (G-enzyme): AUCG, AUG, G, CU, ACUAUACG
// AUCG AUG G CU ACUAUACG
// 2) (U.C.-enzyme): GGAC, U, AU, GAU, C, U, AC, GC, AU
// GGAC U AU GAU C U AC GC AU

// Applying U.C.-enzyme to 1) : AU/C/G, AU/G, G, C/U, AC/U/AU/AC/G
// Applying G-enzyme to 2): G/G/AC, U, AU, G/AU, C, U, AC, G/C, AU

/* Extended bases are what one obtains after the treatment with the two enzymes, so it
could be more than one letter, it's what we obtain between two dots, or at the beginning and
end of the fragments */
// A single extended base does not straddle the /
// A) These are G, U, AU, C, U, AC, AU
// 1) G and 2) U, AU, C, U, AC, AU

// An interior extended base is between / /
// B) These are C, U, AU, AC, G
// 1) C, U, AU, AC and 2) G

// There are two more extended bases in A) than B)
// A) and B) both have G, U, AU, C, AC as their extended bases
// There is an extra U and AU in A)
// Since U is already at the end (based on the project description of CU), AU is in the beginning

// Non-single fragments are fragments that have at least more than one extended base

//---------------------------------------------------------------------------------------------------------------------------------------
// Global variables:
var refragmented_g_enzyme = [];
var refragmented_uc_enzyme = [];
var single_fragments_one_eb = [];
var interior_extended_bases = [];
var non_single_fragments = [];
var abnormal_fragments = [];
var nodes = [];
var nodes_information = [];
var startNode;
var endNode;
var nodes_and_weighted_arcs = [];
var graph;
var path = [];
var circuit = [];
let curr_vertex;
var adjacents = [];

var receiveInput = function () {
  let g_enzyme_set = $("#G-enzyme-set").val(); // Receive the user's fragmented RNA chain after the G-enzyme has been applied
  let uc_enzyme_set = $("#UC-enzyme-set").val(); // Receive the user's fragmented RNA chain after the U.C.-enzyme has been applied

  console.log("G-enzyme set: " + g_enzyme_set);
  console.log("U.C.-enzyme set: " + uc_enzyme_set);


  $("#g-enzyme").text("Input for G-enzyme set: " + g_enzyme_set);
  $("#uc-enzyme").text("Input for UC-enzyme set: " + uc_enzyme_set);
  // Pass the fragments into this function to further re-fragment by applying the opposite enzymes
  refragmentTheInput(g_enzyme_set, uc_enzyme_set);
};

//-------------------------------------------------------------------------------------------
// Simulate treating each fragment in the G-enzyme set with the U.C.-enzyme
// Simulate treating each fragment in the U.C.-enzyme set with the G-enzyme
// The result will be a refragmentation of each fragment into extended bases
function refragmentTheInput(g_enzyme_set, uc_enzyme_set) {
  let refragmented_g_set = ""; // Apply U.C. enzyme
  let refragmented_uc_set = ""; // Apply G-enzyme

  // Loop through the g_enzyme user input string
  for (let i = 0; i < g_enzyme_set.length; i++) {
    // Apply the U.C.-enzyme to this string! Fragment after every U and after every C
    // If the base is a U or C and the following index is not a space, then insert a leading / to indicate a fragment
    if (
      (g_enzyme_set[i] == "U" || g_enzyme_set[i] == "C") &&
      g_enzyme_set[i + 1] !== " "
    ) {
      // Take the refragmented string created so far, concatenate it with the current U or C, and attach a / in front
      refragmented_g_set = refragmented_g_set + g_enzyme_set[i] + "/";
    }
    // The base is not a U or C
    else {
      // Take the refragmented string created so far, concatenate it with the current base, no need to attach a / (no fragment)
      refragmented_g_set = refragmented_g_set + g_enzyme_set[i];
    }
  }
  console.log("Applying U.C. enzyme to G-enzyme-set : " + refragmented_g_set);
  $("#refragmented-g-set").text("Refragmented G-enzyme set after applying U.C. enzyme: " + refragmented_g_set);

  // Loop through the uc_enzyme user input string
  for (let i = 0; i < uc_enzyme_set.length; i++) {
    // Apply the G-enzyme to this string! Fragment after every G
    // If the base is a G and the following index is not a space, then insert a leading / to indicate a fragment
    if (uc_enzyme_set[i] == "G" && uc_enzyme_set[i + 1] !== " ") {
      // Take the refragmented string created so far, concatenate it with the current G, and attach a / in front
      refragmented_uc_set = refragmented_uc_set + uc_enzyme_set[i] + "/";
    }
    // The base is not a G
    else {
      // Take the refragmented string created so far, concatenate it with the current base, no need to attach a / (no fragment)
      refragmented_uc_set = refragmented_uc_set + uc_enzyme_set[i];
    }
  }

  console.log("Applying G enzyme to U.C.-enzyme-set : " + refragmented_uc_set);
  $("#refragmented-uc-set").text("Refragmented UC-enzyme set after applying G enzyme: " + refragmented_uc_set);

  checkForAbnormalFragments(refragmented_g_set, refragmented_uc_set);
  // Pass the refragmentation of each fragment to find their extended bases
  findExtendedBases(refragmented_g_set, refragmented_uc_set);
}
//-------------------------------------------------------------------------------------------

/* Extended bases are what one obtains after the treatment with the two enzymes, so it
could be more than one letter, it's what we obtain between two dots, or at the beginning and
end of the fragments */
// A single extended base does not straddle the /
// A) These are G, U, AU, C, U, AC, AU
// 1) G and 2) U, AU, C, U, AC, AU

// An interior extended base is between / /
// B) These are C, U, AU, AC, G
// 1) C, U, AU, AC and 2) G
function findExtendedBases(refragmented_g_set, refragmented_uc_set) {
  //-------------------------Single extended base code------------------------------------------
  // A single extended base does not straddle the /
  // Basically find the strings that have spaces on both sides
  let array_g_set = refragmented_g_set.split(" ");
  let array_uc_set = refragmented_uc_set.split(" ");

  console.log("Refragmented G-set (U.C. applied already) : " + array_g_set);
  refragmented_g_enzyme = array_g_set;
  console.log(array_g_set);
  console.log("Refragmented U.C-set (G applied already) : " + array_uc_set);
  refragmented_uc_enzyme = array_uc_set;
  console.log(array_uc_set);

  for (let i = 0; i < array_g_set.length; i++) {
    // If an index contains an instance of a /, then it is not a single extended base, continue
    if (array_g_set[i].includes("/")) {
      continue;
    }
    // Indicies that contain a string with no instance of a / is a single extended base
    else {
      single_fragments_one_eb.push(array_g_set[i]);
    }
  }

  for (let i = 0; i < array_uc_set.length; i++) {
    // If an index contains an instance of a /, then it is not a single extended base, continue
    if (array_uc_set[i].includes("/")) {
      continue;
    }
    // Indicies that contain a string with no instance of a / is a single extended base
    else {
      single_fragments_one_eb.push(array_uc_set[i]);
    }
  }

  console.log(
    "Array of single (consisting of exactly one e.b.) fragment : " +
      single_fragments_one_eb
  );
  $("#single-fragments").text("Single fragments (coniststinig of exactly on e.b.): " + single_fragments_one_eb.join(" "));

  console.log(single_fragments_one_eb);
  //-------------------------------------------------------------------------------------------

  //-------------------------Interior extended base code---------------------------------------
  // Loop through the array of g_set bases
  for (let i = 0; i < array_g_set.length; i++) {
    // An index of this array is something like AU/C/G
    // So, we must split this string on the "/"
    // fragment_on_double_slash will be an array containing the contents of AU, C, G individually separated
    let fragment_on_double_slash = array_g_set[i].split("/");
    //console.log(fragment_on_double_slash);

    // If the size of the fragmented array is greater than three
    // We can extract the interior extended base code by finding the middle index
    if (fragment_on_double_slash.length >= 3) {
      // Basically trying to all the fragments inbetween the first and last fragments
      for (let j = 1; j < fragment_on_double_slash.length - 1; j++) {
        // Store the interior extended base in the array
        interior_extended_bases.push(fragment_on_double_slash[j]);
      }
    }
  }

  // Loop through the array of uc_set bases
  for (let i = 0; i < array_uc_set.length; i++) {
    // An index of this array is something like G/G/AC
    // So, we must split this string on the "/"
    // fragment_on_double_slash will be an array containing the contents of G, G, AC individually separated
    let fragment_on_double_slash = array_uc_set[i].split("/");
    //console.log(fragment_on_double_slash);

    // If the size of the fragmented array is greater than three
    // We can extract the interior extended base code by finding the middle index
    if (fragment_on_double_slash.length >= 3) {
      // Basically trying to all the fragments inbetween the first and last fragments
      for (let j = 1; j < fragment_on_double_slash.length - 1; j++) {
        // Store the interior extended base in the array
        interior_extended_bases.push(fragment_on_double_slash[j]);
      }
    }
  }

  // Print out the array of interior extended bases
  console.log("Array of interior extended bases : ", interior_extended_bases);
  console.log(interior_extended_bases);
  $("#interior-extended-bases").text("Interior extended bases: " + interior_extended_bases.join(" "));

  //-------------------------------------------------------------------------------------------

  //-------------------------Non-single fragment code---------------------------------------
  // Find all fragments that consist of one or more bases

  // Loop through the array of g_set bases
  for (let i = 0; i < array_g_set.length; i++) {
    // If a fragment in a certain index includes a /, that means there is more than one base included
    if (array_g_set[i].includes("/")) {
      // Store that non_single_fragment in the array
      non_single_fragments.push(array_g_set[i]);
    }
  }

  // Loop through the array of uc_set bases
  for (let i = 0; i < array_uc_set.length; i++) {
    // If a fragment in a certain index includes a /, that means there is more than one base included
    if (array_uc_set[i].includes("/")) {
      // Store that non_single_fragment in the array
      non_single_fragments.push(array_uc_set[i]);
    }
  }

  // Print out the array of non-single fragments
  console.log("All non-single fragments : ", non_single_fragments);
  console.log(non_single_fragments);
  $("#non-single-fragments").text("All non-single fragments: " + non_single_fragments.join(" "));

  // After finding all associated extended bases (single fragments, interior extended bases, non-single fragments)
  // We need to construct the multidigraph using these bases as nodes and edges
  determineNodesAndEdges();
}
//-------------------------------------------------------------------------------------------

// Check for fragments that do not follow the G-enzyme or UC-enzyme format
function checkForAbnormalFragments(refragmented_g_set, refragmented_uc_set) {
  let array_g_set = refragmented_g_set.split(" ");
  let array_uc_set = refragmented_uc_set.split(" ");

  // Loop through the g_set
  for (let i = 0; i < array_g_set.length; i++) {
    // Find an individual fragment and determine the last character
    let examine_last_char_in_fragment = array_g_set[i];
    let fragment_length = examine_last_char_in_fragment.length;
    // For example, a fragment could be AU/C/G as an element in array_g_set
    // Let's find the length of this fragment (aka string)

    // Here, the string of a fragment is indexed
    // If the last character in the string of the fragment is not G, then this fragment did not properly receive the G-enzyme
    if (examine_last_char_in_fragment[fragment_length - 1] != "G") {
      // Push this abnormal fragment to the array
      abnormal_fragments.push(array_g_set[i]);
    }
  }

  // Loop through the uc_set
  for (let i = 0; i < array_uc_set.length; i++) {
    // Find an individual fragment and determine the last character
    let examine_last_char_in_fragment = array_uc_set[i];
    let fragment_length = examine_last_char_in_fragment.length;
    //console.log(examine_last_char_in_fragment, fragment_length);
    // For example, a fragment could be G/G/AC as an element in array_uc_set
    // Let's find the length of this fragment (aka string)

    // Here, the string of a fragment is indexed
    // If the last character in the string of the fragment is not U or C, then this fragment did not properly receive the UC-enzyme
    if (examine_last_char_in_fragment[fragment_length-1] != "U" && examine_last_char_in_fragment[fragment_length-1] != "C") {
      // Push this abnormal fragment to the array
      //console.log(examine_last_char_in_fragment[fragment_length-1]);
      abnormal_fragments.push(array_uc_set[i]);
    }
  }

  // Edge case so that U is the edge back to the root node
  let fragmented_pieces = abnormal_fragments[0].split("/");
  endNode = fragmented_pieces[fragmented_pieces.length - 1];

  // Print out the abnormal fragments
  console.log("Fragments that are abnormal : ", abnormal_fragments);
}

//-------------------------------------------------------------------------------------------
// We must determine all nodes and edges for the multidigraph
function determineNodesAndEdges() {
  // Loop through the non_single fragements
  for (let i = 0; i < non_single_fragments.length; i++) {
    // Split a fragment (like AU/C/G) into individual bases on the / (such as AU, C, G)
    let fragmented_pieces = non_single_fragments[i].split("/");
    // If the array of nodes already contains a base we fragemented before
    if (nodes.includes(fragmented_pieces[0])) {
      // We already have this fragemented base as a node, so continue
      continue;
    }

    // If the array of nodes does not already contain a base we fragemented
    else {
      // This base will now be included as a new node
      nodes.push(fragmented_pieces[0]);
    }
  }
  // Print out all the nodes in the graph
  console.log("These are all the nodes in the graphs : ", nodes);
  console.log(nodes);
  $("#nodes").text("All nodes of the graph: " + nodes.join(" "));

  startNode = nodes[0];

  let finished = 1;
  // Loop through the array of non_single_fragments
  for (let i = 0; i < non_single_fragments.length; i++, finished++) {
    // Split a fragment (like AU/C/G) into individual bases on the / (such as AU, C, G)
    // So fragmented_pieces is an array of individual bases
    let fragmented_pieces = non_single_fragments[i].split("/");
    // Find the abnormal pieces of the abnormal fragments
    let abnormal_pieces = abnormal_fragments[0].split("/");

    // If the array fragmented_pieces is length 2 (only 2 bases)
    // That means these two bases will serve as nodes
    if (fragmented_pieces.length === 2) {
      // If the array of fragmented pieces contains an instance of an abnormal piece
      // This is the peculiar case of using the abnormal fragment as an edge to the start node
      if (fragmented_pieces.includes(abnormal_pieces[abnormal_pieces.length - 1])) {
        // Create an object
        let nodes_and_their_edges = {
          firstNode: fragmented_pieces[0],
          secondNode: startNode,
          weightOnArc: abnormal_pieces[abnormal_pieces.length - 1],
        };
        nodes_and_weighted_arcs.push(nodes_and_their_edges);
      }
      // If the array of fragmented pieces does not contain an instance of an abnormal piece
      else {
        // Create an object
        let nodes_and_their_edges = {
          firstNode: fragmented_pieces[0],
          secondNode: fragmented_pieces[1],
          weightOnArc: null,
        };
        nodes_and_weighted_arcs.push(nodes_and_their_edges);
      }
    }

    // Else if the array fragmented_pieces is length 3 (2 bases serve as the node and the middle base is an edge)
    // That means these two bases will serve as nodes 
    else if (fragmented_pieces.length === 3) {
      let nodes_and_their_edges = {
        firstNode: fragmented_pieces[0],
        secondNode: fragmented_pieces[2],
        weightOnArc: fragmented_pieces[1],
      };
      nodes_and_weighted_arcs.push(nodes_and_their_edges);
    }
    
    // Else, the array fragmented_pieces is length > 3 (2 bases serve as the node and the middle base is an edge)
    // That means these two bases will serve as nodes 
    else {
      // Extract the middle edge of multiple bases
      let complete_edge = "";
      // For example: AC/U/AU/AC/G
      // Start from the seconf element (U) and end at the second to last element (AC)
      // So, U/AU/AC/G needs to be extracted as an entire edge, while AC and G are the connecting nodes
      for (let i = 1; i < fragmented_pieces.length - 1; i++) {
        // If we reach the second to last base, do not add a /
        if (i + 1 === fragmented_pieces.length - 1) {
          complete_edge = complete_edge + fragmented_pieces[i];
        }
        // Add a / and continue to the next index
        else {
          complete_edge = complete_edge + fragmented_pieces[i] + "/";
        }
      }

      // After resolving the edge
      let nodes_and_their_edges = {
        firstNode: fragmented_pieces[0],                                // First node is the first base
        secondNode: fragmented_pieces[fragmented_pieces.length - 1],    // Second node is the last base
        weightOnArc: complete_edge,
      };
      nodes_and_weighted_arcs.push(nodes_and_their_edges);
    }
  }

  // Print out the nodes and their arcs
  console.log(
    "These are all the nodes and their associated arcs : ", 
      nodes_and_weighted_arcs
  );
  console.log(nodes_and_weighted_arcs);

  for(let i = 0; i < nodes_and_weighted_arcs.length; i++){
    $("#nodes-and-arcs").append("<li>"+ nodes_and_weighted_arcs[i].firstNode + " goes to " + nodes_and_weighted_arcs[i].secondNode + (nodes_and_weighted_arcs[i].weightOnArc != null ? " on weight " + nodes_and_weighted_arcs[i].weightOnArc : "") + "</li>");
  }

  // Create the graph
  createNodeInformation(nodes_and_weighted_arcs);
}

//----------------------------------------------------------------------------------------------------------
//Make a function called node_information to keep track of all nodes visited using recursion
function createNodeInformation(nodes_and_weighted_arcs){
  // Each node needs to keep track 
  for(let i = 0; i < nodes.length; i++){
    let current_node = {
      node: nodes[i],
      information:[]
    };
    for(let j = 0; j < nodes_and_weighted_arcs.length; j++){
      if(nodes[i] == nodes_and_weighted_arcs[j].firstNode){
        current_node.information.push(
          {
            outgoingArc: nodes_and_weighted_arcs[j].secondNode,
            weightOnArc: nodes_and_weighted_arcs[j].weightOnArc,
            visited: false 
          }
        )
      }
    }
    nodes_information.push(current_node)
  }

  console.log("This is the associated information of each node: ", nodes_information);
  // Create the graph
  createGraph();

  multigraphEulerianCircuit1();
}

//----------------------------------------------------------------------------------------------------------
async function resetVisited(){
  for(let i = 0; i < nodes_information.length; i++){
    for(let j = 0; j < nodes_information[i].information.length; j++){
      nodes_information[i].information[j].visited = false;
    }
  }
  return true;
}

async function seeminglyRepeating(all_paths,index,n,w){
  let frequency_repeat = 0;
  let seemingly_repeated;
  if(nodes_information[n].information[w].weightOnArc==null){
    seemingly_repeated = all_paths[index] + "/" + nodes_information[n].information[w].outgoingArc;
  }
  else{
    seemingly_repeated = all_paths[index] + "/" + nodes_information[n].information[w].weightOnArc + "/" + nodes_information[n].information[w].outgoingArc;
  }

    for(let i = 0; i < all_paths.length; i++){
      if(all_paths[i].includes(seemingly_repeated)){
        console.log("may repeat", true, seemingly_repeated);
        return true;
      }
    }
  console.log("may repeat", false, seemingly_repeated);

  return false;
}

async function multigraphEulerianCircuit1(){
  let all_paths = [];
  let startnode_frequency = 0;
  let starting_paths = [];
  // Get an array of all fragments
  let all_fragments = refragmented_g_enzyme.concat(refragmented_uc_enzyme);
  // How many times the starting node appears in each fragment indicates the amount of RNA chains possible
  for(let i = 0; i < all_fragments.length; i++){
    // Split the current fragment
    let fragmented_pieces = all_fragments[i].split("/");
    // If the first index in the fragment matches the start node
    if(fragmented_pieces[0] == startNode){
      startnode_frequency++;        // This is one possible path
      starting_paths.push(all_fragments[i]);    // Push this possible path
    }
  }

  starting_paths[2] = starting_paths[0];
  starting_paths[3] = starting_paths[1];

  console.log("The possible amounts of RNA chains", startnode_frequency);
  console.log("Possible starting paths: ", starting_paths);

  for(let i = 0; i < startnode_frequency; i++){
    console.log("iteration ", i);
    let finish_reset = await resetVisited();
    // let copy_of_nodes_information = Array.from(nodes_information);
    all_paths.push(starting_paths[i]);
    // console.log(all_paths);
    // console.log("is visited reset", nodes_information);

    if(finish_reset === true)
    {
      for(let j = 0; j < 6; j++){
        let fragmented_pieces = all_paths[i].split('/');

        if(fragmented_pieces.length > 1){
          for(let n = 0; n < nodes_information.length; n++){
            if(fragmented_pieces[0] == nodes_information[n].node){
              for(let w = 0; w < nodes_information[n].information.length; w++){
              
                if(fragmented_pieces.length == 2){
                  if(null === nodes_information[n].information[w].weightOnArc &&
                    fragmented_pieces[1] == nodes_information[n].information[w].outgoingArc){
                    nodes_information[n].information[w].visited = true;
                    break;
                  }
                }
              
                else{
                  if(fragmented_pieces[1] == nodes_information[n].information[w].weightOnArc &&
                    fragmented_pieces[2] == nodes_information[n].information[w].outgoingArc){
                    nodes_information[n].information[w].visited = true;
                    break;
                  }
                }

              }
            }
          }
        }

        let current_last_node = fragmented_pieces[fragmented_pieces.length-1];
        let next_node;
        //let next_node = nodes_information.find(obj => (obj.node == current_last_node && obj.information.Object.visited == false));
        for(let n = 0; n < nodes_information.length; n++){
          if(current_last_node == nodes_information[n].node){
            for(let w = 0; w < nodes_information[n].information.length; w++){
              if(nodes_information[n].information[w].visited == false){
                let repeated = await seeminglyRepeating(all_paths, i, n, w);
                if(repeated == false){
                  nodes_information[n].information[w].visited = true;
                  next_node = nodes_information[n].information[w];
                  break;
                }
              }
            }
            break;
          }
        }

        console.log(next_node);

        if(next_node.weightOnArc == null){
          all_paths[i] = "/" + all_paths[i] + "/" + next_node.outgoingArc;
          console.log(all_paths[i]);
        }
        else{
          all_paths[i] = "/" + all_paths[i] + "/" + next_node.weightOnArc + "/" + next_node.outgoingArc;
          console.log(all_paths[i]);
        }
        
      }
    }
  }

  for(let i = 0; i < all_paths.length; i++){
    let new_path = all_paths[i].split("/");
    let better_path = new_path.join(" ");
    all_paths[i] = better_path.trim();
  }

  for(let i = 0; i < all_paths.length; i++){
    $("#all-possible-paths").append("<li>"+ all_paths[i] + "</li>");
  }

  console.log(all_paths);

}

//


//----------------------------------------------------------------------------------------------------------
// function multigraphEulerianCircuit() {
//   let edge_count = []; //container that will hold vertices and their number of edges
//   // this for loop is to get all the nodes and its adjacents
//   for (let i = 0; i < nodes.length; i++) {
//     // console.log("for node: " + nodes[i]);
//     let temp_adj = [];
//     let temp_weighted_arcs = [];
//     for (let j = 0; j < nodes_and_weighted_arcs.length; j++) {
//       if (nodes_and_weighted_arcs[j].firstNode == nodes[i]) {
//         temp_adj.push(nodes_and_weighted_arcs[j].secondNode);

//         temp_weighted_arcs.push(nodes_and_weighted_arcs[j].weightOnArc);
//       }
//     }

//     // let new_temp =[];
//     // if(temp_adj.length >2){
//     //   for(let i = 0; i< temp_adj.length; i++){
//     //     new_temp[i] = temp_adj[i];
//     //   }
//     //   for(let i = 0; i< new_temp.length; i++)
//     //   {
//     //     if(new_temp[i] == startNode){
//     //       let temp_var= temp_adj[0];
//     //       temp_adj[0] = new_temp[i];
//     //       temp_adj[i] = temp_var;
//     //     }
//     //   }
//     // }

//     let obj_adj = {
//       name: nodes[i],
//       adj: temp_adj.reverse(),
//       // adj: temp_adj,
//       weight: temp_weighted_arcs,
//     };
//     adjacents.push(obj_adj);
//   }

//   for (let i = 0; i < adjacents.length; i++) {
//     let edge_count_ob = {
//       name: adjacents[i].name,
//       num_of_edges: adjacents[i].adj.length,
//       weight_on_arc: adjacents[i].weight,
//     };
//     edge_count.push(edge_count_ob);
//   }

//   path.push(edge_count[0]);
//   curr_vertex = 0; // index of the location of the current vertex in edge_count vector
//   let next_vertex;

//   while (path.length != 0) {
//     if (edge_count[curr_vertex].num_of_edges) {
//       //push current vertex
//       path.push(edge_count[curr_vertex]);

//       for (let i = 0; i < adjacents.length; i++) {
//         if (adjacents[i].name == edge_count[curr_vertex].name) {
//           let temp_next = adjacents[i].adj[adjacents[i].adj.length - 1];

//           for (let j = 0; j < edge_count.length; j++) {
//             if (edge_count[j].name == temp_next) {
//               next_vertex = j; // finds the index of the next vertex
//               adjacents[i].adj.pop();
//               break;
//             }
//           }
//           break;
//         }
//       }

//       //remove the edge
//       edge_count[curr_vertex].num_of_edges =
//         edge_count[curr_vertex].num_of_edges - 1;

//       //move on to the next edge
//       curr_vertex = next_vertex;
//     } else {
//       // console.log("enters the else loop (BACKTRACKS): ");
//       // console.log("this is what we are pushing into circuit: " + edge_count[curr_vertex].name);
//       circuit.push(edge_count[curr_vertex]);

//       for (let i = 0; i < edge_count.length; i++) {
//         if (path[path.length - 1].name == edge_count[i].name) {
//           temp_var = i;
//         }
//       }

//       curr_vertex = temp_var;
//       path.pop();
//     }
//   }

//   console.log(
//     "Final result array without taking in account the nodes in edges: ",
//     circuit.reverse()
//   ); // final result array without taking in account the nodes in edges

//   console.log("EULERIAN PATH: ");
//   // console.log(circuit);

//   let copy_of_nodes_and_weighted_arcs = [];

//   for (let j = 0; j < nodes_and_weighted_arcs.length; j++) {
//     let copy_obj = {
//       copy_first_node: nodes_and_weighted_arcs[j].firstNode,
//       copy_second_node: nodes_and_weighted_arcs[j].secondNode,
//       copy_weight: nodes_and_weighted_arcs[j].weightOnArc,
//       visited: false,
//     };
//     copy_of_nodes_and_weighted_arcs.push(copy_obj);
//   }

//   let final_result = [];
//   for (let i = 1; i < circuit.length; i++) {
//     // console.log(circuit[i - 1].name + "->");
//     final_result.push(circuit[i - 1].name);
//     for (let j = 0; j < nodes_and_weighted_arcs.length; j++) {
//       if (copy_of_nodes_and_weighted_arcs[j].visited != true) {
//         if (nodes_and_weighted_arcs[j].firstNode == circuit[i - 1].name) {
//           if (nodes_and_weighted_arcs[j].secondNode == circuit[i].name) {
//             // console.log(nodes_and_weighted_arcs[j].weightOnArc);
//             if (nodes_and_weighted_arcs[j].weightOnArc != null) {
//               final_result.push(nodes_and_weighted_arcs[j].weightOnArc);
//             }
//             // final_result.push(nodes_and_weighted_arcs[j].weightOnArc);
//             copy_of_nodes_and_weighted_arcs[j].visited = true;
//             break;
//           } else {
//             continue;
//           }
//         }
//       } else {
//         continue;
//       }
//     }
//   }
//   console.log(final_result);
// }

//--------------------------------------------------------------------------------------------------------------

function createGraph() {
  graph = new jsnx.MultiDiGraph();

  graph.addNodesFrom(nodes);
  console.log("Printing the jsnetwork nodes: ", graph.nodes());

  for (let i = 0; i < nodes_and_weighted_arcs.length; i++) {
    graph.addEdge(
      nodes_and_weighted_arcs[i].firstNode,
      nodes_and_weighted_arcs[i].secondNode,
      { weight: nodes_and_weighted_arcs[i].weightOnArc }
    );
  }

  console.log("This is jsnetworkx graph data: ", graph.edges(true));
  console.log("Printing the jsnetwork edges: ", graph.edges(true));

  // graph.addEdge("AU", "G");
  // graph.addEdge("G", "AU");
  // graph.addEdge("G", "AC");
  // graph.addEdge("AC", "G");
  // graph.addEdge("G", "C");
  // graph
  // multigraphEulerianCircuit();
  jsnx.draw(graph, {
    element: "#canvas",
    withLabels: true,
    nodeAttr: {
      r: 15,
    },
    // withEdgeLabels: true,
    stickyDrag: true,
  });
}
