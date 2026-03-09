import 'swagger-ui-react/swagger-ui.css';
import SwaggerUI from 'swagger-ui-react';
import spec from '@/swagger.json';

export default function ApiDocsPage() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
