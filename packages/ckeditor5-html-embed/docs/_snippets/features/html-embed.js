/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, location, console */

import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	HtmlEmbed,
	CodeBlock,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit );

/* eslint-disable max-len */
const initialData =
`
<h2>CKEditor 5 classic editor build</h2>
<div class="raw-html-embed">
	<p><a href="https://www.npmjs.com/package/ckeditor5"><img alt="npm version" src="https://badge.fury.io/js/ckeditor5.svg" /></a>&nbsp;<a href="https://coveralls.io/github/ckeditor/ckeditor5?branch=master"><img alt="Coverage Status" src="https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master" /></a>&nbsp;<a href="https://app.travis-ci.com/github/ckeditor/ckeditor5"><img alt="Build Status" src="https://travis-ci.org/ckeditor/ckeditor5.svg?branch=master" /></a>&nbsp;<img alt="Dependency Status" src="https://img.shields.io/librariesio/release/npm/ckeditor5.svg" /></p>

	<p><a href="http://eepurl.com/c3zRPr"><img alt="Join newsletter" src="https://img.shields.io/badge/join-newsletter-00cc99.svg" /></a>&nbsp;<a href="https://twitter.com/ckeditor"><img alt="Follow twitter" src="https://img.shields.io/badge/follow-twitter-00cc99.svg" /></a></p>
</div>

<p>The classic editor type for CKEditor 5. See a <a href="https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html"><strong>classic editor example demo</strong></a>.</p>

<figure class="image"><img src="https://c.cksource.com/a/1/img/npm/ckeditor5-build-classic.png" alt="CKEditor 5 classic editor type screenshot"></figure>

<h2>Documentation</h2>
<p>See:</p>
<ul>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/quick-start.html">Installation</a> for how to install this package and what it contains.</li>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-lifecycle.html">Editor lifecycle</a> for how to create an editor and interact with it.</li>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/configuration.html">Configuration</a> for how to configure the editor.</li>
</ul>

<h2>Quick start</h2>
<p>First, install the build from npm:</p>
<pre><code class="language-plaintext">npm&nbsp;install&nbsp;ckeditor5</code></pre>

<h2>License</h2>
<p>Licensed under the terms of <a href="http://www.gnu.org/licenses/gpl.html" rel="nofollow">GNU General Public License Version 2 or later</a>. For full details about the license, please check the <code>LICENSE.md</code> file or <a href="https://ckeditor.com/legal/ckeditor-oss-license" rel="nofollow">https://ckeditor.com/legal/ckeditor-oss-license</a>.</p>

<div class="raw-html-embed"><script>
	window.emojicsOpts = {
		widget: '50c7737f072dfd100f3dad0411f02e',
		position: 'inline'
	};
	( function( d, s, id ) {
		var js, fjs = d.getElementsByTagName( s )[ 0 ];
		js = d.createElement( s );
		js.id = id;
		js.src = '//connect.emojics.com/dist/sdk.js';
		fjs.parentNode.insertBefore( js, fjs );
	} )( document, 'script', 'emojics-js' );
</script>
<div id="emojics-root"></div>
</script></div>
`;

ClassicEditor
	.create( document.querySelector( '#snippet-html-embed' ), {
		initialData,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'htmlEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		// The "Preview editor data" button logic.
		document.querySelector( '#preview-data-action' ).addEventListener( 'click', () => {
			const mainCSSElement = [ ...document.querySelectorAll( 'link' ) ]
				.find( linkElement => linkElement.href.endsWith( 'css/styles.css' ) );
			const snippetCSSElement = [ ...document.querySelectorAll( 'link' ) ]
				.find( linkElement => linkElement.href.endsWith( 'snippet.css' ) );

			const iframeElement = document.querySelector( '#preview-data-container' );

			// We create the iframe in a careful way and set the base URL to make emojics widget work.
			// NOTE: the emojics widget works only when hosted on ckeditor.com.
			const html = '<!DOCTYPE html><html>' +
				'<head>' +
					'<meta charset="utf-8">' +
					`<base href="${ location.href }">` +
					`<title>${ document.title }</title>` +
					`<link rel="stylesheet" href="${ mainCSSElement.href }" type="text/css">` +
					`<link rel="stylesheet" href="${ snippetCSSElement.href }" type="text/css">` +
					`<style>
						body {
							padding: 20px;
						}
						.formatted p img {
							display: inline;
							margin: 0;
						}
					</style>` +
				'</head>' +
				'<body class="formatted ck-content">' +
					editor.getData() +
				'</body>' +
				'</html>';

			iframeElement.contentWindow.document.open();
			iframeElement.contentWindow.document.write( html );
			iframeElement.contentWindow.document.close();
		} );

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Insert HTML' ),
			text: 'Click to embed a new HTML snippet.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
