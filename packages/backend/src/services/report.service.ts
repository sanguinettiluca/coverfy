import prisma from "../config/prisma";

export async function getStatistics(brokerId: string) {

    const activePolicies = await prisma.policy.findMany({
        where: {client: {brokerId}, status: "ACTIVE"},
        include: {company: {select: {name: true}}}
    });

    const countByCompany: Record<string, number> = {};

    // Esto podria hacerse con una consulta SQL mas compleja, pero lo hago en memoria para mantenerlo simple
    for(const p of activePolicies){
        const name = p.company.name ?? "Sin Compañia";
        countByCompany[name] = (countByCompany[name] ?? 0) + 1;
    }

    const activePoliciesByCompany = Object.entries(countByCompany)
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => b.count - a.count);

    const clients = await prisma.client.findMany({
        where: {brokerId},
        select: {createdAt: true},
        orderBy: {createdAt: "asc"},
    });

    const signupsByMonth: Record<string, number> = {};
    for(const c of clients){
        const d = c.createdAt;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        signupsByMonth[key] = (signupsByMonth[key] ?? 0) + 1;
    }

    let cumulative = 0;
    const cumulativeClientsByMonth = Object.keys(signupsByMonth)
    .sort()
    .map((month) => {
      cumulative += signupsByMonth[month];
      return { month, total: cumulative };
    });

    return { activePoliciesByCompany, cumulativeClientsByMonth };
}
