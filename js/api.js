function main() {
	// Get the search term from the input box
	var searchTerm = $( '#catname' ).val();
	// Clear existing data, if any
	$( '.card-columns' ).empty();
	// Get most relevant category title
	$.when( findRelevantCategory( searchTerm ) ).done( function( res ) {
		var categoryTitle = res[ 1 ][ 0 ];
		// console.log( categoryTitle );
		$( '#catname' ).val( categoryTitle.substring( firstCategory.indexOf( ':' ) + 1, ) );
		// findPagesInCategory( categoryTitle );
		// Populate search field with right title
	});
}

function findRelevantCategory( searchTerm ) {
	return $.ajax({
		url: "https://en.wikipedia.org/w/api.php/",
		dataType: 'jsonp',
		crossDomain: true,
		data: {
			action:"opensearch",
			format:"json",
			namespace: "14",
			profile: "fuzzy",
			search: searchTerm
		},
		success: function ( res ) {
			firstCategory = res[1][0];
			// console.log( firstCategory );
			// $( '#catname' ).val( firstCategory.substring( firstCategory.indexOf( ':') + 1, ) );
			findPagesInCategory( firstCategory );
		}
	});
}

/**
 * Pull up list of first 10 pages in a given category
 * @param catname
 */
function findPagesInCategory( catname ) {
	$.ajax({
		url: "https://en.wikipedia.org/w/api.php/",
		dataType: 'jsonp',
		crossDomain: true,
		data: {
			action: "query",
			list: "categorymembers",
			format: "json",
			cmtitle: catname,
			cmlimit: 100,
			cmnamespace: 0
		},
		success: function ( res ) {
			$.each( res['query']['categorymembers'], function( index, val ) {
				var pagetitle = res[ 'query' ][ 'categorymembers' ][ index ][ 'title' ];
				$.when( getPageExtract( pagetitle ) ).done( function( extract ) {
					var pageextract = extract['query']['pages'][0]['extract'];
					var img;
					$.when( getPageImage( pagetitle ) ).done( function ( image ) {
						if ( image[ 'query' ][ 'pages' ][ 0 ][ 'thumbnail' ] ) {
							img = image[ 'query' ][ 'pages' ][ 0 ][ 'thumbnail' ][ 'source' ];
						} else {
							img = null;
						}
						addCard( pagetitle, pageextract, img );
					});
				});
			});
		}
	});
}

/**
 * Fetch page extract using the PageExtracts extension API
 * @param pageName
 * @returns {*}
 */
function getPageExtract( pageName ) {
	// Directly return as a callback
	return $.ajax( {
		url: "https://en.wikipedia.org/w/api.php/",
		dataType: 'jsonp',
		crossDomain: true,
		data: {
			action: "query",
			prop: "extracts",
			exchars: "200",
			explaintext:'',
			exsectionformat: 'plain',
			titles: pageName,
			format: "json",
			formatversion: 2
		}
	} );
}

/**
 * Fetch most relevant image for a given page
 * @param pageName
 * @returns {*}
 */
function getPageImage( pageName ) {
	// Directly return as a callback
	return $.ajax( {
		url: "https://en.wikipedia.org/w/api.php/",
		dataType: 'jsonp',
		crossDomain: true,
		data: {
			action: "query",
			prop: "pageimages",
			pithumbsize: "300",
			titles: pageName,
			format: "json",
			formatversion: 2
		}
	} );
}

/**
 * Add a new bootstrap card for the page
 * @param pageTitle
 * @param pageExtract
 * @param img
 */
function addCard( pageTitle, pageExtract, img = null, ) {
	var newcard = $( '<div></div>' ).addClass( 'card' );
	if ( img ) {
		newcard.append( '<div class="fade-in"><img class="card-img-top" alt="dum dum" src=' + img + '></div>' );
	}
	var pageLink = "https://en.wikipedia.org/wiki/" + pageTitle;
	newcard.append(
		$( '<div></div>' ).addClass( 'card-body' ).addClass( 'fade-in' )
			.append( $( '<a href="' + pageLink + '">' + pageTitle + '</a>' ) )
			.append( $( '<p>' + pageExtract + '</p>' ) )
	);
	$( '.card-columns' ).append( newcard );
}
