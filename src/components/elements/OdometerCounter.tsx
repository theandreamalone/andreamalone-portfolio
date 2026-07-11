import OdometerCounterClient from "./OdometerCounterClient";

interface OdometerCounterProps {
  count: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  children?: React.ReactNode;
}

export default function OdometerCounter(props: OdometerCounterProps) {
  return <OdometerCounterClient {...props} />;
}
