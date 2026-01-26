export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-purple-700 mb-4">
          Welcome to FindMyPet 🐾
        </h1>
        <p className="text-gray-600 mb-6">
          You are successfully logged in.
        </p>
        
      </div>
    </div>
  );
}
