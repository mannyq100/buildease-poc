import * as React from "react";
import { Input, InputProps } from "./input";

interface FormFieldProps extends Omit<InputProps, "onChange"> {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validate?: (value: string) => { valid: boolean; message?: string };
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  required = false,
  readOnly = false,
  placeholder,
  helperText,
  className,
  ...rest
}) => {
  const [touched, setTouched] = React.useState(false);
  const [validState, setValidState] = React.useState<"error" | "success" | "warning" | "none">("none");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);
  
  // Validate the field value
  const validateField = React.useCallback(
    (fieldValue: string) => {
      if (!validate) return;
      
      const result = validate(fieldValue);
      
      if (result.valid) {
        setValidState("success");
        setErrorMessage(undefined);
      } else {
        setValidState("error");
        setErrorMessage(result.message);
      }
    },
    [validate]
  );
  
  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (validateOnChange && touched) {
      validateField(newValue);
    }
  };
  
  // Handle blur event
  const handleBlur = () => {
    setTouched(true);
    
    if (validateOnBlur) {
      validateField(value);
    }
    
    if (onBlur) {
      onBlur();
    }
  };
  
  // Reset validation when component mounts or name changes
  React.useEffect(() => {
    setTouched(false);
    setValidState("none");
    setErrorMessage(undefined);
  }, [name]);
  
  return (
    <Input
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      helperText={helperText}
      validState={validState}
      errorMessage={errorMessage}
      className={className}
      {...rest}
    />
  );
};

export default FormField; 