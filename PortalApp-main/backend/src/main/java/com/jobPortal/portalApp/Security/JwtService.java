package com.jobPortal.portalApp.Security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;


@Service
public class JwtService {
    private static final String SECRET_KEY =
            "bXlTdXBlclNlY3JldEtleUZvckp3dEdlbmVyYXRpb24xMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ=";
    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    private SecretKey getSignInKey()
    {
        byte [] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + JWT_EXPIRATION))
                .signWith(getSignInKey())
                .compact();


    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    private Date extractExpiration(String token)
    {
        return extractAllClaims(token).getExpiration();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());

    }

    public  String extractUsername(String token) {
        return extractAllClaims(token).getSubject();

    }
    public boolean isValid(String token, UserDetails userDetails)
    {
        String username= extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);

    }


}
