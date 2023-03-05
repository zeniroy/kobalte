/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/22cb32d329e66c60f55d4fc4025d1d44bb015d71/packages/@react-aria/listbox/src/useListBox.ts
 */

import {
  access,
  composeEventHandlers,
  createGenerateId,
  mergeDefaultProps,
  mergeRefs,
  OverrideComponentProps,
} from "@kobalte/utils";
import { Accessor, createMemo, createUniqueId, JSX, splitProps } from "solid-js";

import { createListState, createSelectableList, ListState } from "../list";
import { AsChildProp, Polymorphic } from "../polymorphic";
import { Collection, CollectionNode } from "../primitives";
import { FocusStrategy, KeyboardDelegate, SelectionBehavior, SelectionMode } from "../selection";
import { ListboxContext, ListboxContextValue } from "./listbox-context";

export interface ListboxRootOptions<T> extends AsChildProp {
  /** The controlled value of the listbox. */
  value?: Iterable<string>;

  /**
   * The value of the listbox when initially rendered.
   * Useful when you do not need to control the state.
   */
  defaultValue?: Iterable<string>;

  /** Event handler called when the value changes. */
  onValueChange?: (value: Set<string>) => void;

  /** An array of options to display as the available options. */
  options?: T[];

  /** Property name or getter function to use as the value of an option. */
  optionValue?: string | ((option: T) => string);

  /** Property name or getter function to use as the text value of an option for typeahead purpose. */
  optionTextValue?: string | ((option: T) => string);

  /** Property name or getter function to use as the disabled flag of an option. */
  optionDisabled?: string | ((option: T) => boolean);

  /** Property name or getter function that refers to the children options of option group. */
  optionGroupChildren?: string | ((optGroup: T) => T[]);

  /** Function used to check if an option is an option group. */
  isOptionGroup?: (maybeOptGroup: T) => boolean;

  /** The controlled state of the listbox. */
  state?: ListState;

  /** An optional keyboard delegate implementation for type to select, to override the default. */
  keyboardDelegate?: KeyboardDelegate;

  /** Whether to autofocus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy;

  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean;

  /** Whether the listbox items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean;

  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;

  /** Whether options should be focused when the user hovers over them. */
  shouldFocusOnHover?: boolean;

  /**
   * The ref attached to the scrollable element, used to provide automatic scrolling on item focus.
   * If not provided, defaults to the listbox ref.
   */
  scrollRef?: Accessor<HTMLElement | undefined>;

  /** How multiple selection should behave in the listbox. */
  selectionBehavior?: SelectionBehavior;

  /** Whether onValueChange should fire even if the new set of keys is the same as the last. */
  allowDuplicateSelectionEvents?: boolean;

  /** The type of selection that is allowed in the listbox. */
  selectionMode?: SelectionMode;

  /** Whether the listbox allows empty selection. */
  disallowEmptySelection?: boolean;

  /** Whether selection should occur automatically on focus. */
  selectOnFocus?: boolean;

  /** Whether typeahead is disabled. */
  disallowTypeAhead?: boolean;

  /** Whether navigation through tab key is enabled. */
  allowsTabNavigation?: boolean;

  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean;

  /** When virtualized, the Virtualizer function used to scroll to the item of the given key. */
  scrollToItem?: (key: string) => void;

  /** A function that receives an _items_ signal representing all listbox items and returns a JSX-Element. */
  children?: (items: Accessor<Collection<CollectionNode<T>>>) => JSX.Element;
}

export type ListboxRootProps<T> = OverrideComponentProps<"ul", ListboxRootOptions<T>>;

/**
 * Listbox presents a list of options and allows a user to select one or more of them.
 */
export function ListboxRoot<T>(props: ListboxRootProps<T>) {
  let ref: HTMLElement | undefined;

  const defaultId = `listbox-${createUniqueId()}`;

  props = mergeDefaultProps(
    {
      id: defaultId,
      selectionMode: "single",
      isVirtualized: false,
    },
    props
  );

  const [local, others] = splitProps(props, [
    "ref",
    "children",
    "value",
    "defaultValue",
    "onValueChange",
    "options",
    "optionValue",
    "optionTextValue",
    "optionDisabled",
    "optionGroupChildren",
    "isOptionGroup",
    "state",
    "keyboardDelegate",
    "autoFocus",
    "selectionMode",
    "shouldFocusWrap",
    "shouldUseVirtualFocus",
    "shouldSelectOnPressUp",
    "shouldFocusOnHover",
    "allowDuplicateSelectionEvents",
    "disallowEmptySelection",
    "selectionBehavior",
    "selectOnFocus",
    "disallowTypeAhead",
    "allowsTabNavigation",
    "isVirtualized",
    "scrollToItem",
    "scrollRef",
    "onKeyDown",
    "onMouseDown",
    "onFocusIn",
    "onFocusOut",
  ]);

  const listState = createMemo(() => {
    if (local.state) {
      return local.state;
    }

    return createListState({
      selectedKeys: () => local.value,
      defaultSelectedKeys: () => local.defaultValue,
      onSelectionChange: local.onValueChange,
      allowDuplicateSelectionEvents: () => access(local.allowDuplicateSelectionEvents),
      disallowEmptySelection: () => access(local.disallowEmptySelection),
      selectionBehavior: () => access(local.selectionBehavior),
      selectionMode: () => access(local.selectionMode),
      dataSource: () => local.options ?? [],
      getKey: () => local.optionValue,
      getTextValue: () => local.optionTextValue,
      getIsDisabled: () => local.optionDisabled,
      getSectionChildren: () => local.optionGroupChildren,
      getIsSection: () => local.isOptionGroup,
    });
  });

  const selectableList = createSelectableList(
    {
      selectionManager: () => listState().selectionManager(),
      collection: () => listState().collection(),
      autoFocus: () => access(local.autoFocus),
      shouldFocusWrap: () => access(local.shouldFocusWrap),
      keyboardDelegate: () => local.keyboardDelegate,
      disallowEmptySelection: () => access(local.disallowEmptySelection),
      selectOnFocus: () => access(local.selectOnFocus),
      disallowTypeAhead: () => access(local.disallowTypeAhead),
      shouldUseVirtualFocus: () => access(local.shouldUseVirtualFocus),
      allowsTabNavigation: () => access(local.allowsTabNavigation),
      isVirtualized: () => local.isVirtualized,
      scrollToKey: () => local.scrollToItem,
    },
    () => ref,
    () => local.scrollRef?.()
  );

  const context: ListboxContextValue = {
    listState,
    generateId: createGenerateId(() => others.id!),
    shouldUseVirtualFocus: () => props.shouldUseVirtualFocus,
    shouldSelectOnPressUp: () => props.shouldSelectOnPressUp,
    shouldFocusOnHover: () => props.shouldFocusOnHover,
    isVirtualized: () => local.isVirtualized,
  };

  return (
    <ListboxContext.Provider value={context}>
      <Polymorphic
        fallback="ul"
        ref={mergeRefs(el => (ref = el), local.ref)}
        role="listbox"
        tabIndex={selectableList.tabIndex()}
        aria-multiselectable={
          listState().selectionManager().selectionMode() === "multiple" ? true : undefined
        }
        onKeyDown={composeEventHandlers([local.onKeyDown, selectableList.onKeyDown])}
        onMouseDown={composeEventHandlers([local.onMouseDown, selectableList.onMouseDown])}
        onFocusIn={composeEventHandlers([local.onFocusIn, selectableList.onFocusIn])}
        onFocusOut={composeEventHandlers([local.onFocusOut, selectableList.onFocusOut])}
        {...others}
      >
        {local.children?.(listState().collection)}
      </Polymorphic>
    </ListboxContext.Provider>
  );
}
