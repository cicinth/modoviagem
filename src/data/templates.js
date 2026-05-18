export const defaultPackingList = [
  {
    section: "Mochila",
    items: [
      "Doleira",
      "Passaporte",
      "RG",
      "Carregador do celular",
      "Fones",
      "Uma muda de roupa",
      "Carteira com cartao",
      "Dinheiro",
      "Oculos de sol",
      "Carregador portatil",
      "Protetor de pescoco",
      "Carteirinha de vacina",
      "Escova de dente",
      "Pasta de dente",
      "Fio dental",
      "Protetor solar de rosto",
      "Serum",
      "Perfume de bolso",
      "Gloss",
      "Maquiagem essencial",
      "Xuxinha de cabelo",
      "Mascara",
      "Adaptador universal de tomada",
      "Kindle",
      "Carregador do Kindle",
      "Microfone para videos",
      "Tripe para videos"
    ]
  },
  {
    section: "Mala",
    items: [
      "Shampoo",
      "Condicionador",
      "Matizador",
      "Sabonetes",
      "Oleo de cabelo",
      "Creme",
      "Sabonete de rosto",
      "Protetor solar",
      "Maquiagem",
      "Desodorante",
      "Creme de corpo",
      "Tenis",
      "Sapato",
      "Escova de cabelo",
      "Acessorios",
      "Toalha de banho microfibra",
      "Calcinhas",
      "Sutia",
      "Lente de contato",
      "Pijama",
      "Looks",
      "Roupas comfy",
      "Meias",
      "Bolsas para sair",
      "Airtag",
      "Cadeado",
      "Guarda chuva"
    ]
  }
];

export const emptyTrip = {
  name: "",
  status: "upcoming",
  sourceUrl: "",
  images: "",
  dates: "",
  documents: "",
  tasks: "",
  useDefaultPacking: true,
  packingSourceUrl: "",
  packingList: "",
  insuranceRequired: "no",
  insuranceTicket: "",
  flightItinerary: "",
  flightReservation: "",
  flightLocator: "",
  accommodationCheckin: "",
  accommodationCheckout: "",
  accommodationLink: "",
  accommodationAddress: "",
  accommodationArrival: "",
  mobilityTickets: "",
  itinerarySourceUrl: "",
  itineraryMarkdown: ""
};

export const sampleTrips = [
  {
    id: "rio",
    name: "Rio de Janeiro",
    status: "upcoming",
    sourceUrl: "https://www.notion.so/Rio-de-Janeiro-32150c588c648088909ed0b762a08da3",
    dates: "02/04/2026 a 05/04/2026",
    images: [
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Copacabana",
    sourceKind: "Notion"
  },
  {
    id: "nordeste",
    name: "Nordeste",
    status: "upcoming",
    sourceUrl: "https://www.notion.so/Nordeste-ce75cfa355ef4e2d91e692527ba9e267",
    dates: "10 dias, a definir",
    images: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Patos, Joao Pessoa e Pipa",
    sourceKind: "Notion"
  },
  {
    id: "eurotrip",
    name: "EuroTrip",
    status: "finished",
    sourceUrl: "https://www.notion.so/EuroTrip-69531e50127448a193bebbbf0f9738b4",
    dates: "18/10/2025 a 07/11/2025",
    images: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Italia, Franca, Suica e Inglaterra",
    sourceKind: "Notion"
  },
  {
    id: "colombia",
    name: "Colombia Trip",
    status: "finished",
    sourceUrl: "https://www.notion.so/Colombia-Trip-4c39ad396de64e06b8a90a0aad9b045b",
    dates: "07/04/2024 a 18/04/2024",
    images: [
      "https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Bogota e Cartagena",
    sourceKind: "Notion"
  }
];
