import { createSignal } from "solid-js";

import { Combobox, I18nProvider } from "../src";

interface Food {
  value: string;
  label: string;
  disabled: boolean;
}

interface Category {
  label: string;
  options: Food[];
}

const options: Category[] = [
  {
    label: "Fruits",
    options: [
      { value: "apple", label: "Apple", disabled: false },
      { value: "banana", label: "Banana", disabled: false },
      { value: "blueberry", label: "Blueberry", disabled: false },
      { value: "grapes", label: "Grapes", disabled: true },
      { value: "pineapple", label: "Pineapple", disabled: false },
    ],
  },
  {
    label: "Meat",
    options: [
      { value: "beef", label: "Beef", disabled: false },
      { value: "chicken", label: "Chicken", disabled: false },
      { value: "lamb", label: "Lamb", disabled: false },
      { value: "pork", label: "Pork", disabled: false },
    ],
  },
];

export default function App() {
  const [value, setValue] = createSignal<Food[]>([]);

  return (
    <I18nProvider locale="en-US">
      <Combobox.Root<Food, Category>
        options={options}
        optionValue="value"
        optionTextValue="label"
        optionDisabled="disabled"
        optionGroupChildren="options"
        multiple
        value={value()}
        onChange={setValue}
        placeholder="Select a fruit..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class="combobox__item">
            {props.item.rawValue.label}
          </Combobox.Item>
        )}
        sectionComponent={props => (
          <Combobox.Section class="combobox__section">
            {props.section.rawValue.label}
          </Combobox.Section>
        )}
      >
        <Combobox.Control<Food> class="combobox__trigger">
          {({ selectedOptions }) => (
            <>
              {selectedOptions()
                .map(option => option.label)
                .join(", ")}
              <Combobox.Input />
              <Combobox.Trigger class="combobox__icon" />
            </>
          )}
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Content class="combobox__content">
            <Combobox.Listbox class="combobox__listbox" />
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>
    </I18nProvider>
  );
}

/*

<Combobox.Root<Food, Category>
        options={options}
        optionValue="value"
        optionTextValue="label"
        optionDisabled="disabled"
        optionGroupChildren="options"
        multiple
        value={value()}
        onChange={setValue}
        placeholder="Select a fruit..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class="combobox__item">
            {props.item.rawValue.label}
          </Combobox.Item>
        )}
        sectionComponent={props => (
          <Combobox.Section class="combobox__section">
            {props.section.rawValue.label}
          </Combobox.Section>
        )}
      >
        <Combobox.Control<Food> class="combobox__trigger">
          {({ selectedOptions }) => (
            <>
              {selectedOptions()
                .map(option => option.label)
                .join(", ")}
              <Combobox.Input />
              <Combobox.Trigger class="combobox__icon" />
            </>
          )}
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Content class="combobox__content">
            <Combobox.Listbox class="combobox__listbox" />
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>


*/
