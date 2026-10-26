import { useEffect, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';

function getInitial(companyName = '') {
  return companyName.trim().charAt(0).toUpperCase();
}

export default function CompanyLogo({ companyName, logo, size = 40, className = '' }) {
  const imageRef = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [logo]);

  const style = { width: size, height: size };
  const classes = `company-logo ${className}`.trim();

  if (!logo || failed) {
    return <span className={classes} style={style} role="img" aria-label={companyName ? `${companyName} logo unavailable` : 'Company logo unavailable'}>
      {getInitial(companyName) || <Building2 className="company-logo-placeholder" size={Math.max(16, Math.round(size * 0.48))} aria-hidden="true" />}
    </span>;
  }

  return <span className={classes} style={style}>
    <img ref={imageRef} src={logo} alt={`${companyName} logo`} onError={() => setFailed(true)} />
  </span>;
}
