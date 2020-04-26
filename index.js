// 1) (G-enzyme): AUCG, AUG, G, CU, ACUAUACG
// 2) (U.C.-enzyme): GGAC, U, AU, GAU, C, U, AC, GC, AU

// Applying U.C.-enzyme to 1) : AU/C/G, AU/G, G, C/U, AC/U/AU/AC/G
// Applying G-enzyme to 2): G/G/AC, U, AU, G/AU, C, U, AC, G/C, AU

/* Extended bases are what one obtains after the treatment with the two enzymes, so it
could be more than one letter, it's what we obtain between two dots, or at the beginning and
end of the fragments */
    // A single extended bases does not straddle the /
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

var receiveInput = function(){
  var g_enzyme_set = $("#G-enzyme-set").val();
  var uc_enzyme_set = $("#UC-enzyme-set").val();
  console.log(g_enzyme_set + " " + uc_enzyme_set);
};
