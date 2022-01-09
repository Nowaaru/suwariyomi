/* eslint-disable react/destructuring-assignment */
import React, { PropsWithChildren } from 'react';

type ButtonProps = {
  [key: string]: any;
} & React.ComponentPropsWithoutRef<'button'>;
type ButtonState = {
  content: PropsWithChildren<JSX.Element>;
};
class Button extends React.Component<ButtonProps, ButtonState> {
  constructor(props: { [k: string]: any }) {
    super(props);
    this.state = {
      content: props.children,
    };
  }

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        onClick={this.props.onClick}
      >
        {this.state.content}
      </button>
    );
  }
}

export default Button;
