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
var single_fragments_one_eb = [];
var interior_extended_bases = [];
var non_single_fragments = [];
var abnormal_fragments = [];
var nodes = [];
var startNode;
var endNode;
var nodes_and_weighted_arcs = [];
var graph;
var path = [];
var circuit = [];
let curr_vertex;
var adjacents = [];

var receiveInput = function() {
  let g_enzyme_set = $("#G-enzyme-set").val(); // Receive the user's fragmented RNA chain after the G-enzyme has been applied
  let uc_enzyme_set = $("#UC-enzyme-set").val(); // Receive the user's fragmented RNA chain after the U.C.-enzyme has been applied

  console.log("G-enzyme set: " + g_enzyme_set);
  console.log("U.C.-enzyme set: " + uc_enzyme_set);

  // Pass the fragments into this function to further re-fragment by applying the opposite enzymes
  refragmentTheInput(g_enzyme_set, uc_enzyme_set);
};

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
    if ((g_enzyme_set[i] == 'U' || g_enzyme_set[i] == 'C') && g_enzyme_set[i + 1] !== " ") {
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

  // Loop through the uc_enzyme user input string
  for (let i = 0; i < uc_enzyme_set.length; i++) {
    // Apply the G-enzyme to this string! Fragment after every G
    // If the base is a G and the following index is not a space, then insert a leading / to indicate a fragment
    if (uc_enzyme_set[i] == 'G' && uc_enzyme_set[i + 1] !== " ") {
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

  checkForAbnormalFragments(refragmented_g_set, refragmented_uc_set);
  // Pass the refragmentation of each fragment to find their extended bases
  findExtendedBases(refragmented_g_set, refragmented_uc_set);
}


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
  console.log(array_g_set);
  console.log("Refragmented U.C-set (G applied already) : " + array_uc_set);
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

  console.log("Array of single (consisting of exactly one e.b.) fragment : " + single_fragments_one_eb);
  console.log(single_fragments_one_eb);
  //-------------------------------------------------------------------------------------------

  //-------------------------Interior extended base code---------------------------------------
  for (let i = 0; i < array_g_set.length; i++) {

    let fragment_on_double_slash = array_g_set[i].split("/");
    //console.log(fragment_on_double_slash);

    if(fragment_on_double_slash.length >= 3){
      for (let j = 1; j < fragment_on_double_slash.length - 1; j++) {
        interior_extended_bases.push(fragment_on_double_slash[j]);
      }
    }
  }

  for (let i = 0; i < array_uc_set.length; i++) {

    let fragment_on_double_slash = array_uc_set[i].split("/");
    //console.log(fragment_on_double_slash);

    if(fragment_on_double_slash.length >= 3){
      for (let j = 1; j < fragment_on_double_slash.length - 1; j++) {
        interior_extended_bases.push(fragment_on_double_slash[j]);
      }
    }
  }

  console.log("Array of interior extended bases : " + interior_extended_bases);
  console.log(interior_extended_bases);

  //-------------------------------------------------------------------------------------------

  //-------------------------Non-single fragment code---------------------------------------
  for (let i = 0; i < array_g_set.length; i++) {
    //
    if (array_g_set[i].includes("/")) {
      non_single_fragments.push(array_g_set[i]);
    }
  }

  for (let i = 0; i < array_uc_set.length; i++) {

    if (array_uc_set[i].includes("/")) {
      non_single_fragments.push(array_uc_set[i]);
    }
  }

  console.log("All non-single fragments : " + non_single_fragments);
  console.log(non_single_fragments);

  determineNodesAndEdges();

}
  //-------------------------------------------------------------------------------------------

function checkForAbnormalFragments(refragmented_g_set, refragmented_uc_set){
  let array_g_set = refragmented_g_set.split(" ");
  let array_uc_set = refragmented_uc_set.split(" ");

  for(let i = 0; i < array_g_set.length; i++){
    let examine_last_char_in_fragment = array_g_set[i];
    let fragment_length = examine_last_char_in_fragment.length;

    if(examine_last_char_in_fragment[fragment_length-1] != 'G'){
      abnormal_fragments.push(array_g_set[i]);
    }
  }

  let fragmented_pieces = abnormal_fragments[0].split("/");
  endNode = fragmented_pieces[fragmented_pieces.length-1];

  console.log("Fragments that are abnormal : " + abnormal_fragments);
}

function determineNodesAndEdges(){
  for(let i = 0; i < non_single_fragments.length; i++){
    let fragmented_pieces = non_single_fragments[i].split("/");
    if(nodes.includes(fragmented_pieces[0])){
      continue;
    }

    else{
      nodes.push(fragmented_pieces[0]);
    }
  }

  console.log("These are all the nodes in the graphs : " + nodes);
  console.log(nodes);

  startNode = nodes[0];

  for(let i = 0; i < non_single_fragments.length; i++){
    let fragmented_pieces = non_single_fragments[i].split("/");
    let abnormal_pieces = abnormal_fragments[0].split("/");

    if(fragmented_pieces.length === 2){

      if(fragmented_pieces.includes(abnormal_pieces[abnormal_pieces.length-1])){
        let nodes_and_their_edges = {
          firstNode: fragmented_pieces[0],
          secondNode: startNode,
          weightOnArc: abnormal_pieces[abnormal_pieces.length-1]
        };
        nodes_and_weighted_arcs.push(nodes_and_their_edges);
      }

      else{
        let nodes_and_their_edges = {
          firstNode: fragmented_pieces[0],
          secondNode: fragmented_pieces[1],
          weightOnArc: null
        };
        nodes_and_weighted_arcs.push(nodes_and_their_edges);
      }
    }

    else if(fragmented_pieces.length === 3){
      let nodes_and_their_edges = {
        firstNode: fragmented_pieces[0],
        secondNode: fragmented_pieces[2],
        weightOnArc: fragmented_pieces[1]
      };
      nodes_and_weighted_arcs.push(nodes_and_their_edges);
    }

    else{
      let complete_edge = "";
      for(let i = 1; i < fragmented_pieces.length-1; i++){
        if(i + 1 === fragmented_pieces.length-1){
          complete_edge = complete_edge + fragmented_pieces[i];
        }
        else{
          complete_edge = complete_edge + fragmented_pieces[i] + "/";
        }
      }

      let nodes_and_their_edges = {
        firstNode: fragmented_pieces[0],
        secondNode: fragmented_pieces[fragmented_pieces.length-1],
        // weightOnEdge: complete_edge
        weightOnArc: complete_edge
      };
      nodes_and_weighted_arcs.push(nodes_and_their_edges);
    }
  }

  console.log("These are all the nodes and their associated arcs : " + nodes_and_weighted_arcs);
  console.log(nodes_and_weighted_arcs);
  createGraph();
}

function multigraphEulerianCircuit()
{
  
  let edge_count = []; //container that will hold vertices and their number of edges
  // this for loop is to get all the nodes and its adjacents
  for(let i = 0; i < nodes.length; i++)
  {
    // console.log("for node: " + nodes[i]);
    let temp_adj =[];
    let temp_weighted_arcs = [];
    for(let j = 0; j < nodes_and_weighted_arcs.length; j++)
    {
      if(nodes_and_weighted_arcs[j].firstNode == nodes[i])
      {
        temp_adj.push(nodes_and_weighted_arcs[j].secondNode);
        
        temp_weighted_arcs.push(nodes_and_weighted_arcs[j].weightOnArc);  
       

      }
      
    }

    // let new_temp =[];
    // if(temp_adj.length >2){
    //   for(let i = 0; i< temp_adj.length; i++){
    //     new_temp[i] = temp_adj[i];
    //   }
    //   for(let i = 0; i< new_temp.length; i++)
    //   {
    //     if(new_temp[i] == startNode){
    //       let temp_var= temp_adj[0];
    //       temp_adj[0] = new_temp[i];
    //       temp_adj[i] = temp_var;
    //     }
    //   }
    // }

    let obj_adj = {
      name: nodes[i],
      adj: temp_adj.reverse(),
      // adj: temp_adj,
      weight: temp_weighted_arcs
    }
    adjacents.push(obj_adj);
      
  }

  for(let i= 0; i <adjacents.length; i++){
    let edge_count_ob = {
      name: adjacents[i].name,
      num_of_edges: adjacents[i].adj.length,
      weight_on_arc: adjacents[i].weight

    }
    edge_count.push(edge_count_ob);
  }

 
  path.push(edge_count[0]);
  curr_vertex = 0; // index of the location of the current vertex in edge_count vector
  let next_vertex;
  
  while (path.length != 0)
  {
 
    
    if(edge_count[curr_vertex].num_of_edges )
    {

      //push current vertex
      path.push(edge_count[curr_vertex]);
      
      for(let i=0; i < adjacents.length; i++){
        if(adjacents[i].name == edge_count[curr_vertex].name)
        {
          let temp_next = adjacents[i].adj[adjacents[i].adj.length - 1];
       
          for(let j=0; j < edge_count.length; j++){
            
            if(edge_count[j].name == temp_next)
            {
             
              next_vertex = j; // finds the index of the next vertex 
              adjacents[i].adj.pop();
              break;
            }
          }
          break;
        }
      }
 
      //remove the edge 
      edge_count[curr_vertex].num_of_edges = edge_count[curr_vertex].num_of_edges - 1 ;
  
      //move on to the next edge
      curr_vertex = next_vertex;
  
    }

   

  else{
    // console.log("enters the else loop (BACKTRACKS): "); 
    // console.log("this is what we are pushing into circuit: " + edge_count[curr_vertex].name);
    circuit.push(edge_count[curr_vertex]);
  
    for(let i=0; i < edge_count.length; i ++){
      
      if(path[path.length - 1].name == edge_count[i].name)
      { 
        temp_var = i;
      }      
    }
    
      curr_vertex = temp_var;
      path.pop();
    
  }
   
  }

  console.log(circuit.reverse()); // final result array without taking in account the nodes in edges
 
  console.log("EULERIAN PATH: ");
  // console.log(circuit);

  let copy_of_nodes_and_weighted_arcs = [];

  for(let j=0; j < nodes_and_weighted_arcs.length; j++){
    let copy_obj = {
      copy_first_node : nodes_and_weighted_arcs[j].firstNode,
      copy_second_node : nodes_and_weighted_arcs[j].secondNode,
      copy_weight : nodes_and_weighted_arcs[j].weightOnArc,
      visited: false
    }
    copy_of_nodes_and_weighted_arcs.push(copy_obj);
  }
  
   let final_result = [];
  for(let i=1; i < circuit.length; i++){
    // console.log(circuit[i - 1].name + "->");
    final_result.push(circuit[i - 1].name );
    for(let j=0; j < nodes_and_weighted_arcs.length; j++)
    {
      if(copy_of_nodes_and_weighted_arcs[j].visited != true) {
        if(nodes_and_weighted_arcs[j].firstNode == circuit[i -1].name)
       {
          if(nodes_and_weighted_arcs[j].secondNode == circuit[i].name){
            // console.log(nodes_and_weighted_arcs[j].weightOnArc);
            if(nodes_and_weighted_arcs[j].weightOnArc != null){
              final_result.push(nodes_and_weighted_arcs[j].weightOnArc);
            }
            // final_result.push(nodes_and_weighted_arcs[j].weightOnArc);
            copy_of_nodes_and_weighted_arcs[j].visited = true;
           break;
          }
          else{
            continue;
          }
        }
      }
      else {
        continue;
      }
    }
    
  }
  console.log(final_result);
}



function createGraph(){
  graph = new jsnx.MultiDiGraph();

  graph.addNodesFrom(nodes);
  console.log(graph.nodes());

  for(let i = 0; i < nodes_and_weighted_arcs.length; i++){
    graph.addEdge(nodes_and_weighted_arcs[i].firstNode, nodes_and_weighted_arcs[i].secondNode, {weight: nodes_and_weighted_arcs[i].weightOnArc} );
  }
  console.log("This is jsnetworkx graph data:" + graph.edges(true));
  console.log(graph.edges(true));

  // graph.addEdge("AU", "G");
  // graph.addEdge("G", "AU");
  // graph.addEdge("G", "AC");
  // graph.addEdge("AC", "G");
  // graph.addEdge("G", "C");
  // graph
  multigraphEulerianCircuit();
  jsnx.draw(graph, {
    element: '#canvas',
    withLabels: true,
    nodeAttr:{
      r: 15
    },
    // withEdgeLabels: true,
    stickyDrag: true
});

}
