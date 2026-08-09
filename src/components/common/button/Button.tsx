import { Btn, TButton } from "./ButtonStyles";

const Button = (props: TButton) => {
  const { children } = props;

  return <Btn {...props}>{children}</Btn>;
};

export default Button;
