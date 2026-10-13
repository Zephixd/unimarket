export interface CategoryItem {
  id: string
  label: string
  iconName: string
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'a8d46f74-1020-4f50-84f3-4927504d351a',
    label: 'Libros, apuntes y materiales académicos',
    iconName: 'BookOpen',
  },
  {
    id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6',
    label: 'Calculadoras',
    iconName: 'Calculator',
  },
  {
    id: '71b04623-2815-4bb0-8e95-680bd135f650',
    label: 'Tecnología',
    iconName: 'Laptop',
  },
  {
    id: '5b6e7061-3d7d-4ee5-acae-acba85c60ab9',
    label: 'Accesorios electrónicos',
    iconName: 'Headphones',
  },
  {
    id: 'db883c7a-b9e9-4c5b-aeea-07c45f5dd968',
    label: 'Mochilas y accesorios universitarios',
    iconName: 'Backpack',
  },
  {
    id: 'fe8651ac-28d0-4617-8402-f04844a98743',
    label: 'Uniformes',
    iconName: 'Shirt',
  },
  {
    id: '5fb25357-3759-4515-8fb7-89699ff6f172',
    label: 'Materiales de laboratorio',
    iconName: 'FlaskConical',
  },
  {
    id: 'c055667f-9d73-4d83-a730-1864d68ecc8d',
    label: 'Otros',
    iconName: 'Package',
  },
]
