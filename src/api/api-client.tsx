// Bu dosyanın en üstünde endpoint tanımını tutuyoruz ancak kullanmayacağız.
export const endpoint = process.env.REACT_APP_SERVICE_URI ? process.env.REACT_APP_SERVICE_URI : 'http://localhost:4133/';

// --- Mock (Sahte) Veri Tanımları ---
const mockCategories = [
    { _id: '1', name: 'Living Room', visible: true },
    { _id: '2', name: 'Bedroom', visible: true },
    { _id: '3', name: 'Kitchen', visible: true },
    { _id: '4', name: 'Bathroom', visible: true }
];

const mockFurniture: { [key: string]: any[] } = {
    '1': [
        { _id: '1', name: 'Sofa', width: 2, height: 1, imagePath: 'sofa.svg', category: '1' },
        { _id: '2', name: 'Coffee Table', width: 1, height: 0.6, imagePath: 'table.svg', category: '1' },
        { _id: '3', name: 'Armchair', width: 1, height: 1, imagePath: 'armchair.svg', category: '1' }
    ],
    '2': [
        { _id: '4', name: 'Bed', width: 2, height: 1.5, imagePath: 'bed.svg', category: '2' },
        { _id: '5', name: 'Nightstand', width: 0.5, height: 0.4, imagePath: 'nightstand.svg', category: '2' }
    ],
    '3': [
        { _id: '6', name: 'Refrigerator', width: 0.6, height: 0.6, imagePath: 'fridge.svg', category: '3' },
        { _id: '7', name: 'Stove', width: 0.6, height: 0.6, imagePath: 'stove.svg', category: '3' }
    ],
    '4': [
        { _id: '8', name: 'Toilet', width: 0.4, height: 0.6, imagePath: 'toilet.svg', category: '4' },
        { _id: '9', name: 'Sink', width: 0.5, height: 0.4, imagePath: 'sink.svg', category: '4' }
    ]
};

const mockWindow = { width: 1, height: 0.1, imagePath: 'window' };
const mockDoor = { width: 0.8, height: 0.1, imagePath: 'door' };


// --- Sahte Veri Döndüren Fonksiyonlar ---

// Kategori verilerini sahte olarak döndürür.
export async function getCategories() {
    console.log("getCategories: Using mock data.");
    // Gerçek bir API isteği gibi davranması için Promise yapısı kullanıyoruz.
    return Promise.resolve({
        json: () => Promise.resolve(mockCategories)
    });
}

// Kategoriye ait mobilya verilerini sahte olarak döndürür.
export async function getCategoryInfo(categoryId: string) {
    console.log(`getCategoryInfo for ${categoryId}: Using mock data.`);
    return Promise.resolve({
        json: () => Promise.resolve(mockFurniture[categoryId] || [])
    });
}

// Pencere verisini sahte olarak döndürür.
export async function getWindow() {
    console.log("getWindow: Using mock data.");
    return Promise.resolve([mockWindow]);
}

// Kapı verisini sahte olarak döndürür.
export async function getDoor() {
    console.log("getDoor: Using mock data.");
    return Promise.resolve([mockDoor]);
}
 