/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/focusobserver
 */

/* globals setTimeout, clearTimeout */

import DomEventObserver from './domeventobserver';
import type DomEventData from './domeventdata';
import type View from '../view';
import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type { ViewDocumentSelectionChangeEvent } from './selectionobserver';

/**
 * {@link module:engine/view/document~Document#event:focus Focus}
 * and {@link module:engine/view/document~Document#event:blur blur} events observer.
 * Focus observer handle also {@link module:engine/view/rooteditableelement~RootEditableElement#isFocused isFocused} property of the
 * {@link module:engine/view/rooteditableelement~RootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 */
export default class FocusObserver extends DomEventObserver<'focus' | 'blur'> {
	/**
	 * Identifier of the timeout currently used by focus listener to delay rendering execution.
	 */
	private _timeoutId!: ReturnType<typeof setTimeout>;

	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'focus', 'blur' ] as const;

	private _isFocusing = false;

	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		this.useCapture = true;
		this.priority = 'high';

		const document = this.document;

		document.on<ViewDocumentFocusEvent>( 'focus', ( evt, data ) => {
			if ( this._timeoutId ) {
				clearTimeout( this._timeoutId );
			}

			this.document.isFocusChanging = true;
			this._isFocusing = true;

			const domSelection = data.domTarget.ownerDocument.defaultView!.getSelection()!;
			const viewSelection = view.domConverter.domSelectionToView( domSelection );

			// The selection is already in the focused element (for example in Firefox) so just flush the focused state.
			if ( viewSelection.editableElement && viewSelection.editableElement == data.target ) {
				this._timeoutId = setTimeout( () => this.flush(), 0 );
			} else {
				this._timeoutId = setTimeout( () => this.flush(), 50 );
			}
		} );

		document.on<ViewDocumentBlurEvent>( 'blur', ( evt, data ) => {
			if ( this._timeoutId ) {
				clearTimeout( this._timeoutId );
			}

			this.document.isFocusChanging = true;
			this._isFocusing = false;

			const relatedViewElement = view.domConverter.mapDomToView( data.domEvent.relatedTarget as HTMLElement );

			// Blurred to some element outside editor editable elements.
			if ( !relatedViewElement ) {
				// Flushing it immediately so there is no blinking of selection replaced with marker.
				this.flush();
			} else {
				this._timeoutId = setTimeout( () => this.flush(), 50 );
			}
		} );

		view.on<ObservableChangeEvent>( 'change:hasDomSelection', () => {
			if ( !this.document.isFocusChanging ) {
				return;
			}

			if ( this._timeoutId ) {
				clearTimeout( this._timeoutId );
			}

			this._timeoutId = setTimeout( () => this.flush(), 0 );
		} );

		document.on<ViewDocumentSelectionChangeEvent>( 'selectionChange', () => {
			if ( !this.document.isFocusChanging ) {
				return;
			}

			if ( this._timeoutId ) {
				clearTimeout( this._timeoutId );
			}

			this._timeoutId = setTimeout( () => this.flush(), 0 );
		}, { priority: 'low' } );
	}

	/**
	 * Finishes setting the document focus state.
	 */
	public flush(): void {
		if ( !this.document.isFocusChanging ) {
			return;
		}

		const selection = this.view.document.selection;
		const editableElement = selection && selection.editableElement;
		const domEditableElement = editableElement && this.view.domConverter.mapViewToDom( editableElement );

		const domDocument = domEditableElement && domEditableElement.ownerDocument;
		const domActiveElement = domDocument && domDocument.activeElement;
		const isFocused = domDocument && domDocument.hasFocus() && domEditableElement && domActiveElement == domEditableElement;

		if ( isFocused == this._isFocusing ) {
			this.document.isFocusChanging = false;
			this.document.isFocused = isFocused;

			this.view.change( () => {} );
		}
	}

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: FocusEvent ): void {
		this.fire( domEvent.type, domEvent );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._timeoutId ) {
			clearTimeout( this._timeoutId );
		}

		super.destroy();
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~Document#focus
 * @param data Event data.
 */
export type ViewDocumentFocusEvent = {
	name: 'focus';
	args: [ data: DomEventData<FocusEvent> ];
};

/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link module:engine/view/observer/focusobserver~FocusObserver}.
 *
 * Note that because {@link module:engine/view/observer/focusobserver~FocusObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/focusobserver~FocusObserver
 * @eventName module:engine/view/document~Document#blur
 * @param data Event data.
 */
export type ViewDocumentBlurEvent = {
	name: 'blur';
	args: [ data: DomEventData<FocusEvent> ];
};
