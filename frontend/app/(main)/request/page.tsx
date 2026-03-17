import { RequestForm } from "@/components/RequestForm";

export default function RequestPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <RequestForm />
        </div>
      </div>
    </div>
  );
}
