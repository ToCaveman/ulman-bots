# UlmaņBots

Lielākais latviešu Discord ekonomikas bots.

Pelni naudu, zvejo, apzodz citus un griez aparātus līdz nebēdai!

- 110+ serveros
- 40+ unikālas mantas
- 22 komandas

**Bota uzaicinājums uz serveri -> [šeit](https://discord.com/api/v9/oauth2/authorize?client_id=892747599143125022&scope=bot%20applications.commands)**

# Kā palaist botu

## Pirms sāc

1. Ieinstalē [Bun](https://bun.sh/).
2. Ieinstalē Docker.
3. Izveido Discord botu un pievieno to savam serverim (ieteicams izveidot jaunu testa serveri).

## 1. Noklonē Git repozitoriju

```sh
git clone https://github.com/deimoss123/ulman-bots
cd ulman-bots
```

## 2. Izveido .env failu

- Projekta saknē izveido `.env` failu, izmantojot `.env.example` kā piemēru.
- Ievadi nepieciešamās vērtības.


## 3. Izveido Mango datubāzi
Lai palaistu Mongo datubāzi ar Docker:

```sh
docker compose up -d
```

Lai izslēgtu:

```sh
docker compose down
```

## 4. Ieinstalē paciņas

```sh
bun install
```

## 5. Reģistrē komandas

Vienam serverim (DEV_SERVER_ID):

```sh
bun register
```

Visos serveros:

```sh
bun register:global
```

## 6. Augšupielādē botam nepieciešamos emoji

```sh
bun uploadEmojis
```

Lai izdzēstu visus emoji:

```sh
bun deleteEmojis
```

## 7. Palaid botu

Izstrādes režīms, restartēsies pēc failu izmaiņās:

```sh
bun dev
```

Parastais režīms, ignorēs izmaiņas:

```sh
bun start
```