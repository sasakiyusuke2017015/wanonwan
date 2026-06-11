import { Select } from './Select';

export default {
  title: '入力/選択/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of options with value and label properties',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    onChange: {
      action: 'changed',
      description: 'Function called when selection changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default = {
  args: {
    options: sampleOptions,
    value: '',
    onChange: () => {},
  },
};

export const WithPlaceholder = {
  args: {
    options: sampleOptions,
    value: '',
    placeholder: 'Please select an option',
    onChange: () => {},
  },
};

export const WithSelectedValue = {
  args: {
    options: sampleOptions,
    value: 'option2',
    onChange: () => {},
  },
};

export const WithCustomClass = {
  args: {
    options: sampleOptions,
    value: '',
    className: 'w-64',
    onChange: () => {},
  },
};

export const ManyOptions = {
  args: {
    options: [
      { value: 'jp', label: '日本' },
      { value: 'us', label: 'アメリカ' },
      { value: 'uk', label: 'イギリス' },
      { value: 'fr', label: 'フランス' },
      { value: 'de', label: 'ドイツ' },
    ],
    value: '',
    placeholder: '国を選択してください',
    onChange: () => {},
  },
};
