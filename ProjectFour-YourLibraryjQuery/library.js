/*
 * library.js
 * Allows selection of book items on the page
 * 
 */

/* Array of Books */
var books = [
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "copyright": 1813,
        "pages": 432,
    }, {
        "title": "The Giver",
        "author": "Lois Lowry",
        "copyright": 1993,
        "pages": 240,
    }
];

// When the page is loaded, call the pageLoadedMain function
$(document).ready(pageLoadedMain);

/*
 * Once the DOM has loaded, load in the book from the array,
 * add click listeners to each book title.
 */
function pageLoadedMain() {
    // Load the default book if it doesn't exist in local storage
    loadDefaultBook();

    // Load the book titles into the nav element
    loadBookTitles();

    // Add click listeners to each book title
    addBookTitleListeners();

    // Add click listeners to the edit and add buttons
    addButtonListeners();
}

// Check if the default book exists in local storage, and if not, load it from the array
function loadDefaultBook() {
    let testBanana = localStorage.getItem( "Banana");
    if( testBanana == null) {
        console.log("Loading book from array");
        for( var index = 0; index < books.length; index++) {
            let aBook = books[index];
            localStorage.setItem( aBook.title, JSON.stringify( aBook));
        }
    }
}

/*
 * Creates an unordered list of book titles from the localStorage object,
 * and places it in the navigation element's innerHTML.
 */
function loadBookTitles() {
    console.log("load book titles!")
    var listing = "<ul>\n";
    // Loop through each key in localStorage
    for( var j = 0; j < localStorage.length; j ++) {
        var key = localStorage.key( j);
        console.log( "Local storage key " + j + " is " + key);
        // Retrieve the book object from localStorage using the key
        var aBookObjectAsString = localStorage.getItem( key);
        console.log( "  book string: " + aBookObjectAsString);
        var aBookObject = JSON.parse( aBookObjectAsString);
        // Add the book title to the unordered list
        listing += "<li>" + aBookObject.title + "</li>\n";
    }
    listing += "</ul>\n";

    // Get the navigation element and set its innerHTML to the unordered list
    var navNode = $("nav");
    navNode.html(listing);
}

/*
 * Adds a click event listener to each book title in navigation, calling
 * the onSelect method.
 */ 
function addBookTitleListeners() {
    // Get all the <li> nodes in the navigation element
    var liNodes = $("li");
    // Loop through each <li> node and add a click event listener to it
    liNodes.each(function() {
        $(this).on("click", onSelect);
    });
}

function addButtonListeners() {
    // Get the edit button and add a click event listener to it
    let editButton = $("#editbutton");
    editButton.on("click", onEdit);

    // Get the add button and add a click event listener to it
    let addButton = $("#addbutton");
    addButton.on("click", onAdd);

    // Get the delete button and add a click event listener to it
    let deleteButton = $("#deletebutton");
    deleteButton.on("click", onDelete);
}


/*
 * Fills in the information in the main section given the selected book.
 */
function onSelect() {
    // Get the title of the selected book from the clicked element
    var bookTitle = $(this).html();
    console.log("Found the title: " + bookTitle);

    // Get the book object from local storage by its title
    let targetBookString = localStorage.getItem(bookTitle);
    let targetBook = JSON.parse(targetBookString);

    // Highlight selected number in listing
    $("nav li").removeClass("active");
    $(this).addClass("active");

    // Fill in the details of the selected book in the main section
    $("#title").val(targetBook.title);
    $("#author").val(targetBook.author);
    $("#copyright").val(targetBook.copyright);
    $("#pages").val(targetBook.pages);

    // Get the ISBN of the selected book from the Open Library API
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
        // Pass the XMLHttpRequest and the book title to the informationReceived function
        informationReceived(xhr, bookTitle);
        // Display the cover image of the selected book using its ISBN
        displayCover(xhr.responseText);
    });
    xhr.open("GET", "https://openlibrary.org/search.json?q=" + bookTitle);
    xhr.send();
}

/*
Called when the user clicks the Edit button.
Enters edit mode or exits edit mode depending on the current state.
*/
function onEdit() {
    console.log("onEdit called");
    var editButton = $(this);
    var titleNode = $("#title");
    var authorNode = $("#author");
    var copyNode = $("#copyright");
    var pagesNode = $("#pages");
    if( editButton.html() == "Edit") {
        // Enter edit mode
        editButton.html("Save");
        // Make input fields editable
        titleNode.prop("readOnly", false);
        authorNode.prop("readOnly", false);
        copyNode.prop("readOnly", false);
        pagesNode.prop("readOnly", false);
        // Disable the add button
        $("#addbutton").attr("disabled", true);
    }
    else {
        // Exit edit mode
        editButton.html("Edit");
        // Get the current book title and make input fields read-only
        var bookTitle = titleNode.val();
        authorNode.prop("readOnly", true);
        copyNode.prop("readOnly", true);
        pagesNode.prop("readOnly", true);
        // Save the data to localStorage
        let targetBook = JSON.parse(localStorage.getItem(bookTitle));
        if (!targetBook) {
            // If the book doesn't exist in localStorage, create a new book object
            targetBook = {title: bookTitle, author: "", copyright: "", pages: ""};
        }
        console.log("Found the book object " + targetBook.title);
        // Update the book object with the new information
        targetBook.author = authorNode.val();
        targetBook.copyright = copyNode.val();
        targetBook.pages = pagesNode.val();
        localStorage.setItem(bookTitle, JSON.stringify(targetBook));
        // Enable the add button
        $("#addbutton").removeAttr("disabled");
        // Recreate the book list to reflect the changes
        loadBookTitles();
        addBookTitleListeners();
    }
}

function onAdd() {
    console.log("Called onAdd");
    var addButton = $("#addbutton");
    var editButton = $("#editbutton");
    var titleNode = $("#title");
    var authorNode = $("#author");
    var copyNode = $("#copyright");
    var pagesNode = $("#pages");
    if (addButton.text() === "Add") {
        // Enter add mode
        addButton.text("Save");
        // Clear the input fields and allow editing
        titleNode.val("");
        titleNode.prop("readonly", false);
        authorNode.val("");
        authorNode.prop("readonly", false);
        copyNode.val("");
        copyNode.prop("readonly", false);
        pagesNode.val("");
        pagesNode.prop("readonly", false);
        // Disable the edit button
        editButton.prop("disabled", true);
    } else {
        // Exit add mode, save book info into new object in the array
        addButton.text("Add");
        // Create a new book object with the input field values
        var book = {
            title: titleNode.val(),
            author: authorNode.val(),
            copyright: copyNode.val(),
            pages: pagesNode.val(),
        };
        localStorage.setItem(book.title, JSON.stringify(book));
        loadBookTitles();
        addBookTitleListeners();

        // Add the new book object to the array and recreate the book list
        localStorage.setItem(book.title, JSON.stringify(book));
        loadBookTitles();
        addBookTitleListeners();
        titleNode.prop("readonly", true);
        authorNode.prop("readonly", true);
        copyNode.prop("readonly", true);
        pagesNode.prop("readonly", true);

        // Enable the edit button
        editButton.prop("disabled", false);
    }
}

/*
 *  Deletes the currently selected item.
 */
function onDelete() {
    // Remove the selected item from local storage
    console.log("onDelete");
    var bookName = $("#title").val();
    localStorage.removeItem(bookName);
    // Rebuild the name list
    loadBookTitles();
    addBookTitleListeners();
    // Select nothing as the default.
    selectNothing();
}

/* Displays the information received from openlibrary.org */
function informationReceived(xhr) {
    // check if the status of the HTTP response is not 200 (OK)
    if (xhr.status !== 200) {
        // if it's not OK, alert the user with an error message
        alert("Error making HTTP request");
        return;
    }
    var response = JSON.parse(xhr.responseText);
    // construct the URL for the cover image using the ISBN number of the first result
    var coverUrl = "http://covers.openlibrary.org/b/isbn/" + response.docs[0].isbn[0] + "-M.jpg";
    // get the cover image element from the HTML document using its ID
    var cover = $("#cover");
    console.log("Displaying the cover image");
}

/* This function is called to display the cover image */
function displayCover(responseText) {
    // parse the JSON response text
    var response = JSON.parse(responseText);
    // if there are results in the response, construct the URL for the cover image
    if (response.docs.length > 0) {
        var coverUrl = "http://covers.openlibrary.org/b/id/" + response.docs[0].cover_i + "-L.jpg";
        // get the cover image element from the HTML document using its ID
        var coverImage = $("#coverImage");
        // set its source URL to the constructed URL and display it
        if (coverImage) {
            coverImage.attr("src", coverUrl);
            coverImage.css("display", "block");
        }
    }
}

/*
 *  Deselects any item by setting all the information fields to
 *  their initial values in the html document.
 */
function selectNothing() {
    // set the values of the input elements to "None"
    $("#title").val("None");
    $("#author").val("none");
    $("#copyright").text("");
    $("#pages").text("");
}
