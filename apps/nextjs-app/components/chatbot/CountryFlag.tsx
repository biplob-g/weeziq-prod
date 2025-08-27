import React from "react";
import ReactCountryFlag from "react-country-flag";

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  className?: string;
  title?: string;
  showBorder?: boolean;
}

const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 20,
  className = "",
  title,
  showBorder = true,
}) => {
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{
        width: `${size}px`,
        height: `${size * 0.75}px`, // Maintain aspect ratio
        borderRadius: showBorder ? "2px" : "0",
        display: "inline-block",
        verticalAlign: "middle",
      }}
      title={title || countryCode}
      className={className}
    />
  );
};

export default CountryFlag;
