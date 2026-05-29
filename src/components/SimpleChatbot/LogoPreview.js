import React, { useEffect, useState } from "react";
import altLogo from "../../images/ameya_logo.svg";
import { Shimmer } from "react-shimmer";
import brandLogoApi from "../../api/services/fectchBrandLogo";
import { ReactSVG } from "react-svg";

export default function LogoPreview({ config }) {
    const [logoUrl, setLogoUrl] = useState(null);
    const logoPath = null;
    const [loading, setLoading] = useState(false);

    const loadLogo = async () => {
        setLoading(true);
        try {

            const app_logo_name = config?.APP_DETAILS?.app_logo_name ?? null;
            if (app_logo_name) {

                const appflyte_backend_base_url = config?.API_URL_CONFIGS?.appflyte_backend_base_url ?? null;
                const logo_res = await brandLogoApi.getBrandLogo(appflyte_backend_base_url, app_logo_name);

                if (logo_res.status === 200) {
                    const logo_res_data = logo_res?.data?.at(-1) ?? null;
                    const logo_url = Object.values(logo_res_data)?.at(-1) ?? null;
                    if (logo_url) {
                        setLogoUrl(logo_url)
                    }
                }

            }

        } catch (err) {
            console.error("Logo load failed:", err);
        } finally {
            setLoading(false);
        }
    };
 useEffect(() => {
        loadLogo();
        return () => {
            if (logoUrl && !logoPath?.endsWith(".svg")) {
                URL.revokeObjectURL(logoUrl);
            }
        };
    }, [config]);

    if (loading) return <Shimmer width={204} height={53} />;

    const isSvg = logoUrl?.includes(".svg");

    return logoUrl
        ?
        (isSvg
            ?
            (<ReactSVG src={logoUrl}
                beforeInjection={(svg) => {
                    svg.setAttribute("style", "width:100%; height:100%; object-fit:contain;");
                }}
            />)
            :
            (<img src={logoUrl} alt="Logo" style={{ maxWidth: 300, maxHeight: 100 }} />)
        )
        :
        (<img src={altLogo} alt="Fallback Logo" style={{ maxWidth: 300, maxHeight: 100 }} />)
}