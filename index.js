// jshint esversion:6

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
let single_fragments_one_eb = [];
let interior_extended_bases = [];
let non_single_fragments = [];

var abnormal_fragments = [];



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

  // Pass the refragmentation of each fragment to find their extended bases
  findExtendedBases(refragmented_g_set, refragmented_uc_set);
  checkForAbnormalFragments(refragmented_g_set, refragmented_uc_set);
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
    // If an index contains an instance of a /, then it is not a single extended base, continue
    if (array_g_set[i].includes("/")) {
      non_single_fragments.push(array_g_set[i]);
    }
  }

  for (let i = 0; i < array_uc_set.length; i++) {
    // If an index contains an instance of a /, then it is not a single extended base, continue
    if (array_uc_set[i].includes("/")) {
      non_single_fragments.push(array_uc_set[i]);
    }
  }

  console.log("All non-single fragments : " + non_single_fragments);
  console.log(non_single_fragments);
  //-------------------------------------------------------------------------------------------
}

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

  console.log("Fragments that are abnormal : " + abnormal_fragments);
}
