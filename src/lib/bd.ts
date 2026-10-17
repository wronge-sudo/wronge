/** All 64 districts of Bangladesh, grouped by division (for the checkout form). */
export const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj", "Munshiganj", "Tangail", "Kishoreganj", "Faridpur", "Gopalganj", "Madaripur", "Rajbari", "Shariatpur"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Brahmanbaria", "Chandpur", "Lakshmipur", "Noakhali", "Khagrachhari", "Rangamati", "Bandarban"],
  Rajshahi: ["Rajshahi", "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj"],
  Khulna: ["Khulna", "Bagerhat", "Satkhira", "Jashore", "Jhenaidah", "Magura", "Narail", "Kushtia", "Chuadanga", "Meherpur"],
  Barishal: ["Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export const ALL_DISTRICTS = Object.values(BD_DISTRICTS).flat().sort();
