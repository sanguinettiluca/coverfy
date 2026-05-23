import bcrypt from 'bcryptjs'

// Script temporal para generar un hash de contraseña
// Usar solo para crear el primer usuario ADMIN
async function main() {
  const hash = await bcrypt.hash('Admin123!', 10)
  console.log(hash)
}

main()