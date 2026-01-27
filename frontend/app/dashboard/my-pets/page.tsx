"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";

interface Pet {
  _id: string;
  name: string;
  age: number;
  photo: string;
  qrCodeUrl: string;
}

export default function MyPets() {
  const [pets, setPets] = useState<Pet[]>([]);

  const fetchPets = async () => {
    const res = await api.get("/pet/my-pets");
    setPets(res.data.pets);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/pet/delete/${id}`);
    fetchPets();
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Pets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.map((pet) => (
          <div key={pet._id} className="border p-4 rounded shadow-md">
            <img src={pet.photo} alt={pet.name} className="w-full h-48 object-cover rounded" />
            <h2 className="text-xl font-bold mt-2">{pet.name}</h2>
            <p>Age: {pet.age}</p>
            <img src={pet.qrCodeUrl} alt="QR Code" className="mt-2 w-32 h-32" />
            <button
              onClick={() => handleDelete(pet._id)}
              className="mt-2 bg-red-500 text-white p-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
