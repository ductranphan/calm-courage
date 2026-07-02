/**
 * Reusable Calm Courage logo.
 *
 * This component wraps the exported SVG logo so screens can render the logo
 * with different sizes without repeating the import path.
 */
import LogoSvg from "../../assets/images/logo.svg";

type Props = {
  width?: number;
  height?: number;
};

export default function Logo({ width = 350, height = 130 }: Props) {
  return <LogoSvg width={width} height={height} />;
}
