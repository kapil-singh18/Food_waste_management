import React, { useState } from 'react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import PageHeader from '../components/ui/PageHeader';

function ImageUploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const submitImage = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post('/check-expiry', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setResult(res.data.data);
  };

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Prevent Expiry Waste"
        title="Image Expiry Detection"
        description="Scan food labels quickly and act early before safe inventory becomes landfill waste."
      />
      <Card toned title="Upload Label Image">
        <form className="form-grid" onSubmit={submitImage}>
          <Field label="Food package image" htmlFor="expiry-file">
            <input id="expiry-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Field>
          <div className="form-action">
            <Button id="check-expiry-btn" type="submit">Check Expiry</Button>
          </div>
        </form>
      </Card>

      {result && (
        <Card title="Scan Result">
          <p>Status: <Badge tone={result.status === 'expired' ? 'danger' : 'success'}>{result.status}</Badge></p>
          <p>Confidence: {result.confidence}</p>
          <p>File: {result.filename}</p>
        </Card>
      )}
    </div>
  );
}

export default ImageUploadPage;
