import { useRef, useState } from 'react';
import CompanyLogo from './CompanyLogo.jsx';
import { readCompanyLogoFile, validateCompanyLogoFile } from '../../services/companyLogoService.js';

export default function CompanyLogoField({ companyName, logo, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validationError = validateCompanyLogoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      onChange(await readCompanyLogoFile(file));
      setError('');
    } catch (reason) {
      setError(reason.message || 'The selected image could not be read.');
    }
  }

  return <div className="company-logo-field">
    <input
      ref={inputRef}
      className="company-logo-input"
      type="file"
      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
      onChange={chooseFile}
      aria-label="Upload Company Logo"
    />
    <div className="company-logo-preview-row">
      <CompanyLogo companyName={companyName} logo={logo} size={52} className="company-logo-preview" />
      <div className="company-logo-actions">
        <button type="button" className="button button-secondary button-small" onClick={() => inputRef.current?.click()}>
          {logo ? 'Replace Logo' : 'Upload Company Logo'}
        </button>
        {logo && <button type="button" className="button button-quiet button-small" onClick={() => { onChange(''); setError(''); }}>
          Remove Logo
        </button>}
      </div>
    </div>
    <p className="field-hint">Optional — if you don't upload a logo, we'll use your company's initial. PNG, JPG, or WebP up to 2 MB.</p>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
  </div>;
}
