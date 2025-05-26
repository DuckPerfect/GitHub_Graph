const FILE_PATH = "./data.json";
const simpleGit = require("simple-git");
const jsonfile = require("jsonfile");
const moment = require("moment");
const random = require("random");

// Initialize simple-git with the current working directory.
// This ensures the script operates on the Git repository where it's executed.
const git = simpleGit(process.cwd());

/**
 * Recursively makes Git commits to simulate activity.
 * Each commit updates a data.json file with a new date.
 *
 * @param {number} n - The number of commits remaining to make.
 */
const makeCommit = (n) => {
  // Base case: If no more commits are needed, push the final changes and return.
  if (n === 0) {
    // Push changes to the remote repository.
    // '-u origin master' sets the upstream for the 'master' branch,
    // so subsequent 'git push' commands can be simpler.
    git.push(["-u", "origin", "master"], (err, result) => {
      if (err) {
        console.error("Error pushing final changes to remote:", err);
      } else {
        console.log("Pushed all changes to remote repository.");
      }
    });
    return;
  }

  // Generate random values for weeks (x) and days (y) to simulate varied commit times.
  const x = random.int(0, 54); // Max 54 weeks in a year
  const y = random.int(0, 6);  // 0-6 days in a week

  // Calculate the date for the commit.
  // Start from the current moment, add 1 day, then add random weeks and days.
  // IMPORTANT: The year is explicitly set to the current year to prevent future dates.
  const DATE_MOMENT = moment()
    .add(1, "d") // Add 1 day to ensure it's not today, giving some buffer.
    .add(x, "w") // Add random weeks.
    .add(y, "d"); // Add random days.

  // Set the year of the commit date to the current year.
  // This is crucial to ensure commits are made within the desired year (e.g., 2025).
  DATE_MOMENT.year(moment().year());

  // Format the moment object into a string for the commit message and file content.
  const DATE = DATE_MOMENT.format();

  const data = {
    date: DATE,
  };
  console.log(`Committing for date: ${DATE}`);

  // Write the generated date to data.json.
  jsonfile.writeFile(FILE_PATH, data, (writeErr) => {
    if (writeErr) {
      console.error("Error writing to data.json:", writeErr);
      // Even if writing fails, try to proceed with Git operations or handle appropriately.
      // For this script, we'll proceed as the error might be transient.
    }

    // Add the data.json file to the Git staging area.
    git
      .add([FILE_PATH])
      // Commit the changes with the generated date as the message and author date.
      .commit(DATE, { "--date": DATE })
      // Push the current branch ('master' or 'main') to the remote 'origin'.
      // The '-u' flag sets the upstream, linking the local branch to the remote one.
      .push(["-u", "origin", "master"], (pushErr, result) => {
        if (pushErr) {
          console.error("Error pushing to remote:", pushErr);
          // If a push fails, it's often due to network issues or permissions.
          // We might want to stop recursion or implement a retry mechanism here.
          // For now, we'll log the error and continue if possible, or stop if fatal.
        } else {
          console.log(`Successfully pushed commit for: ${DATE}`);
          // Recursively call makeCommit for the next commit.
          makeCommit(--n);
        }
      });
  });
};

// Start the commit process by making 120 commits.
makeCommit(120);
