'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auctionAPI } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function CreateAuctionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Auction data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    reserve_price: '',
    item_type: 'LAND',
    condition: '',
    location: '',
    // Land fields
    land_size: '',
    land_type: '',
    coordinates: '',
    ownership_doc: '',
    // Vehicle fields
    make: '',
    model: '',
    year: '',
    mileage: '',
    engine_type: '',
    registration_number: '',
    // Images
    image_urls: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData({
      ...formData,
      image_urls: urls,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Prepare auction data
      const auctionData: any = {
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        reserve_price: parseFloat(formData.reserve_price),
        item: {
          item_type: formData.item_type,
          condition: formData.condition,
          location: formData.location,
          image_urls: formData.image_urls.filter(url => url.trim() !== ''),
          specifications: {},
        },
      };

      // Add specifications based on type
      if (formData.item_type === 'LAND') {
        auctionData.item.specifications = {
          land_size: formData.land_size,
          land_type: formData.land_type,
          coordinates: formData.coordinates,
          ownership_doc: formData.ownership_doc,
        };
      } else {
        auctionData.item.specifications = {
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          engine_type: formData.engine_type,
          registration_number: formData.registration_number,
        };
      }

      const created = await auctionAPI.create(auctionData);
      router.push(`/auctions/${created.id}`);
    } catch (error: any) {
      console.error('Failed to create auction:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(['Failed to create auction. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create Auction with Room</h1>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 text-center py-2 border-b-4 ${
              step >= s ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'
            }`}
          >
            Step {s}
          </div>
        ))}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <ul className="list-disc list-inside text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Auction Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Prime Land in Thimphu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of the item..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reserve Price (Nu)</label>
              <input
                type="number"
                name="reserve_price"
                value={formData.reserve_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Each auction will automatically get its own unique room code for bidding.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Item Type */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item Type</label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LAND">Land</option>
                <option value="VEHICLE">Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <input
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Good, Excellent, Vacant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Thimphu, Bhutan"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Specifications */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.item_type === 'LAND' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Land Size</label>
                  <input
                    type="text"
                    name="land_size"
                    value={formData.land_size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5 acres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Land Type</label>
                  <input
                    type="text"
                    name="land_type"
                    value={formData.land_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Residential, Agricultural"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Coordinates (Optional)</label>
                  <input
                    type="text"
                    name="coordinates"
                    value={formData.coordinates}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 27.4712° N, 89.6339° E"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ownership Document (Optional)</label>
                  <input
                    type="text"
                    name="ownership_doc"
                    value={formData.ownership_doc}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Thram Certificate #12345"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Make</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Land Cruiser"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min="1990"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mileage (km)</label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="45000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Engine Type</label>
                  <input
                    type="text"
                    name="engine_type"
                    value={formData.engine_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Diesel, Petrol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BP-1-A-1234"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Images & Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-4">Upload Images</label>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={5}
                existingImages={formData.image_urls}
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {formData.title}</p>
                <p><strong>Reserve Price:</strong> Nu {formData.reserve_price}</p>
                <p><strong>Type:</strong> {formData.item_type}</p>
                <p><strong>Location:</strong> {formData.location}</p>
                <p><strong>Images:</strong> {formData.image_urls.length} uploaded</p>
                <p className="text-blue-600"><strong>Room:</strong> Will be auto-generated</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Auction & Room'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
