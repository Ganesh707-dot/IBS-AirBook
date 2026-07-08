# Architecture

Inspired by [IBS Software](https://www.ibsplc.com/) airline retailing products: **iRetail**, **iFly RES**, and the Offer–Order–Settle–Deliver (OOSD) value chain.

## Design Decisions

- **Modular monolith** backend — domain packages (`auth`, `offer`, `order`, `catalog`) can be extracted into microservices
- **JWT stateless auth** with role-based access (ADMIN / CUSTOMER)
- **REST API** with OpenAPI documentation
- **Angular standalone components** with lazy-loaded routes
- **H2 in-memory DB** for zero-config local dev; PostgreSQL via Docker profile

## Module Boundaries

| Module | Responsibility |
|--------|---------------|
| `offer` | Flight search, fare families, seat availability |
| `order` | Booking creation, order listing, web check-in |
| `catalog` | Admin route CMS, ancillary product catalog |
| `auth` | Login, JWT generation, security filter chain |

## Future Extensions

- Kafka event bus for order lifecycle events
- AWS deployment (ECS, RDS, API Gateway)
- NDC-style offer/order API contracts
- AI-driven dynamic pricing engine
