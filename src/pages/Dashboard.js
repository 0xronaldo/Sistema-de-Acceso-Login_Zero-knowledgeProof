import React, { useContext, useState } from 'react';
import { AuthContext } from '../ZKPLoginApp';
import ZKPGenerator from '../services/ZKPGenerator';

function Dashboard() {
  const { user, authMethod, zkpCredentials, did, vc, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const verifyCredentials = () => {
    if (vc) {
      const vcResult = ZKPGenerator.verifyCredential(vc);
      const zkpResult = zkpCredentials ? 
        ZKPGenerator.verifyZKProof(
          zkpCredentials.proof,
          zkpCredentials.proof.publicSignals,
          zkpCredentials.verificationKey
        ) : null;

      setVerificationResults({
        vc: vcResult,
        zkp: zkpResult,
        timestamp: new Date().toISOString()
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado al portapapeles');
    }).catch(() => {
      alert('Error al copiar');
    });
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const downloadCredential = (data, filename) => {
    const blob = new Blob([formatJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              {authMethod === 'wallet' ? '🏦' : '👤'}
            </div>
            <div className="user-details">
              <h2>Bienvenido, {user?.name}</h2>
              <p className="auth-method">
                Autenticado por {authMethod === 'wallet' ? 'Wallet' : 'Email'}
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={verifyCredentials}
              className="verify-btn"
            >
              🔍 Verificar Credenciales
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="logout-btn"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Resumen
        </button>
        <button 
          className={`nav-tab ${activeTab === 'did' ? 'active' : ''}`}
          onClick={() => setActiveTab('did')}
        >
          🆔 DID
        </button>
        <button 
          className={`nav-tab ${activeTab === 'vc' ? 'active' : ''}`}
          onClick={() => setActiveTab('vc')}
        >
          📋 Credencial Verificable
        </button>
        <button 
          className={`nav-tab ${activeTab === 'zkp' ? 'active' : ''}`}
          onClick={() => setActiveTab('zkp')}
        >
          🔐 Zero Knowledge Proof
        </button>
      </nav>

      {/* Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-cards">
              <div className="overview-card identity-card">
                <div className="card-icon">🆔</div>
                <div className="card-content">
                  <h3>Identidad Descentralizada (DID)</h3>
                  <p className="did-value">{did}</p>
                  <button 
                    onClick={() => copyToClipboard(did)}
                    className="copy-btn"
                  >
                    📋 Copiar DID
                  </button>
                </div>
              </div>

              <div className="overview-card credential-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <h3>Credencial Verificable</h3>
                  <p>Tipo: {vc?.credentialSubject?.type}</p>
                  <p>Emitida: {vc ? new Date(vc.issuanceDate).toLocaleDateString() : 'N/A'}</p>
                  <button 
                    onClick={() => downloadCredential(vc, 'verifiable-credential.json')}
                    className="download-btn"
                  >
                    💾 Descargar VC
                  </button>
                </div>
              </div>

              <div className="overview-card zkp-card">
                <div className="card-icon">🔐</div>
                <div className="card-content">
                  <h3>Zero Knowledge Proof</h3>
                  <p>Protocolo: {zkpCredentials?.proof?.protocol}</p>
                  <p>Curva: {zkpCredentials?.proof?.curve}</p>
                  <button 
                    onClick={() => downloadCredential(zkpCredentials, 'zkp-proof.json')}
                    className="download-btn"
                  >
                    💾 Descargar ZKP
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Results */}
            {verificationResults && (
              <div className="verification-results">
                <h3>🔍 Resultados de Verificación</h3>
                <div className="verification-grid">
                  <div className={`verification-item ${verificationResults.vc?.valid ? 'valid' : 'invalid'}`}>
                    <h4>Credencial Verificable</h4>
                    <p>Estado: {verificationResults.vc?.valid ? '✅ Válida' : '❌ Inválida'}</p>
                    {verificationResults.vc?.error && (
                      <p className="error-msg">Error: {verificationResults.vc.error}</p>
                    )}
                  </div>
                  
                  {verificationResults.zkp && (
                    <div className={`verification-item ${verificationResults.zkp?.valid ? 'valid' : 'invalid'}`}>
                      <h4>Zero Knowledge Proof</h4>
                      <p>Estado: {verificationResults.zkp?.valid ? '✅ Válido' : '❌ Inválido'}</p>
                      {verificationResults.zkp?.error && (
                        <p className="error-msg">Error: {verificationResults.zkp.error}</p>
                      )}
                    </div>
                  )}
                </div>
                <p className="verification-timestamp">
                  Verificado: {new Date(verificationResults.timestamp).toLocaleString()}
                </p>
              </div>
            )}

            {/* User Details */}
            <div className="user-details-section">
              <h3>📄 Detalles del Usuario</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{user?.id}</span>
                </div>
                <div className="detail-item">
                  <label>Nombre:</label>
                  <span>{user?.name}</span>
                </div>
                {authMethod === 'traditional' && (
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{user?.email}</span>
                  </div>
                )}
                {authMethod === 'wallet' && (
                  <>
                    <div className="detail-item">
                      <label>Dirección:</label>
                      <span className="address">{user?.address}</span>
                    </div>
                    <div className="detail-item">
                      <label>Red:</label>
                      <span>{user?.network?.name}</span>
                    </div>
                  </>
                )}
                <div className="detail-item">
                  <label>Método de Auth:</label>
                  <span className="auth-method-badge">
                    {authMethod === 'wallet' ? '🏦 Wallet' : '📧 Email'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'did' && (
          <div className="did-tab">
            <div className="section-header">
              <h3>🆔 Identidad Descentralizada (DID)</h3>
              <p>Tu identificador único y descentralizado</p>
            </div>
            
            <div className="did-display">
              <div className="did-value-container">
                <label>DID Completo:</label>
                <div className="did-value">
                  <span className="did-text">{did}</span>
                  <button 
                    onClick={() => copyToClipboard(did)}
                    className="copy-btn small"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="did-breakdown">
                <h4>Estructura del DID:</h4>
                <div className="did-parts">
                  <div className="did-part">
                    <label>Esquema:</label>
                    <span>did:</span>
                  </div>
                  <div className="did-part">
                    <label>Método:</label>
                    <span>{did?.split(':')[1]}</span>
                  </div>
                  <div className="did-part">
                    <label>Identificador:</label>
                    <span>{did?.split(':')[2]}</span>
                  </div>
                </div>
              </div>

              <div className="did-info">
                <h4>Características del DID:</h4>
                <ul className="did-features">
                  <li>✅ Descentralizado - No requiere autoridad central</li>
                  <li>✅ Verificable - Puede ser verificado criptográficamente</li>
                  <li>✅ Persistente - Identificador permanente</li>
                  <li>✅ Resolvible - Puede ser resuelto a un documento DID</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vc' && (
          <div className="vc-tab">
            <div className="section-header">
              <h3>📋 Credencial Verificable (VC)</h3>
              <p>Tu certificado digital criptográficamente verificable</p>
            </div>

            {vc && (
              <div className="vc-display">
                <div className="vc-summary">
                  <div className="vc-item">
                    <label>ID de la Credencial:</label>
                    <span>{vc.id}</span>
                  </div>
                  <div className="vc-item">
                    <label>Tipo:</label>
                    <span>{vc.type?.join(', ')}</span>
                  </div>
                  <div className="vc-item">
                    <label>Emisor:</label>
                    <span>{vc.issuer}</span>
                  </div>
                  <div className="vc-item">
                    <label>Fecha de Emisión:</label>
                    <span>{new Date(vc.issuanceDate).toLocaleString()}</span>
                  </div>
                  <div className="vc-item">
                    <label>Fecha de Expiración:</label>
                    <span>{new Date(vc.expirationDate).toLocaleString()}</span>
                  </div>
                </div>

                <div className="credential-subject">
                  <h4>Sujeto de la Credencial:</h4>
                  <div className="subject-details">
                    <div className="subject-item">
                      <label>ID del Sujeto:</label>
                      <span>{vc.credentialSubject.id}</span>
                    </div>
                    <div className="subject-item">
                      <label>Tipo:</label>
                      <span>{vc.credentialSubject.type}</span>
                    </div>
                    {vc.credentialSubject.name && (
                      <div className="subject-item">
                        <label>Nombre:</label>
                        <span>{vc.credentialSubject.name}</span>
                      </div>
                    )}
                    {vc.credentialSubject.email && (
                      <div className="subject-item">
                        <label>Email:</label>
                        <span>{vc.credentialSubject.email}</span>
                      </div>
                    )}
                    {vc.credentialSubject.address && (
                      <div className="subject-item">
                        <label>Dirección de Wallet:</label>
                        <span className="address">{vc.credentialSubject.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="vc-proof">
                  <h4>Prueba Criptográfica:</h4>
                  <div className="proof-details">
                    <div className="proof-item">
                      <label>Tipo de Prueba:</label>
                      <span>{vc.proof.type}</span>
                    </div>
                    <div className="proof-item">
                      <label>Método de Verificación:</label>
                      <span>{vc.proof.verificationMethod}</span>
                    </div>
                    <div className="proof-item">
                      <label>Propósito:</label>
                      <span>{vc.proof.proofPurpose}</span>
                    </div>
                    <div className="proof-item">
                      <label>Dominio:</label>
                      <span>{vc.proof.domain}</span>
                    </div>
                  </div>
                </div>

                <div className="vc-actions">
                  <button 
                    onClick={() => copyToClipboard(formatJson(vc))}
                    className="copy-btn"
                  >
                    📋 Copiar VC Completa
                  </button>
                  <button 
                    onClick={() => downloadCredential(vc, 'verifiable-credential.json')}
                    className="download-btn"
                  >
                    💾 Descargar VC
                  </button>
                </div>

                <details className="vc-raw">
                  <summary>Ver VC Completa (JSON)</summary>
                  <pre className="json-display">{formatJson(vc)}</pre>
                </details>
              </div>
            )}
          </div>
        )}

        {activeTab === 'zkp' && (
          <div className="zkp-tab">
            <div className="section-header">
              <h3>🔐 Zero Knowledge Proof</h3>
              <p>Tu prueba de conocimiento cero para verificación sin revelación</p>
            </div>

            {zkpCredentials && (
              <div className="zkp-display">
                <div className="zkp-summary">
                  <div className="zkp-item">
                    <label>Tipo de Prueba:</label>
                    <span>{zkpCredentials.proof.protocol}</span>
                  </div>
                  <div className="zkp-item">
                    <label>Curva Elíptica:</label>
                    <span>{zkpCredentials.proof.curve}</span>
                  </div>
                  <div className="zkp-item">
                    <label>Tipo de Autenticación:</label>
                    <span>{zkpCredentials.type}</span>
                  </div>
                  <div className="zkp-item">
                    <label>Timestamp:</label>
                    <span>{new Date(zkpCredentials.proof.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="proof-components">
                  <h4>Componentes de la Prueba:</h4>
                  <div className="proof-component">
                    <label>Punto A:</label>
                    <div className="proof-values">
                      <span>[{zkpCredentials.proof.proof.a[0].substring(0, 20)}...]</span>
                      <span>[{zkpCredentials.proof.proof.a[1].substring(0, 20)}...]</span>
                    </div>
                  </div>
                  <div className="proof-component">
                    <label>Punto B:</label>
                    <div className="proof-values">
                      <span>[[{zkpCredentials.proof.proof.b[0][0].substring(0, 15)}...], [{zkpCredentials.proof.proof.b[0][1].substring(0, 15)}...]]</span>
                      <span>[[{zkpCredentials.proof.proof.b[1][0].substring(0, 15)}...], [{zkpCredentials.proof.proof.b[1][1].substring(0, 15)}...]]</span>
                    </div>
                  </div>
                  <div className="proof-component">
                    <label>Punto C:</label>
                    <div className="proof-values">
                      <span>[{zkpCredentials.proof.proof.c[0].substring(0, 20)}...]</span>
                      <span>[{zkpCredentials.proof.proof.c[1].substring(0, 20)}...]</span>
                    </div>
                  </div>
                </div>

                <div className="public-signals">
                  <h4>Señales Públicas:</h4>
                  <div className="signals-list">
                    {zkpCredentials.proof.publicSignals.map((signal, index) => (
                      <div key={index} className="signal-item">
                        <label>Input {index + 1}:</label>
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="zkp-explanation">
                  <h4>¿Cómo funciona?</h4>
                  <div className="explanation-content">
                    <p>
                      Esta prueba de conocimiento cero te permite demostrar que posees 
                      cierta información (como tu identidad o credenciales) sin revelar 
                      la información misma.
                    </p>
                    <ul>
                      <li><strong>Punto A, B, C:</strong> Componentes de la prueba Groth16</li>
                      <li><strong>Señales Públicas:</strong> Valores hasheados que pueden ser verificados</li>
                      <li><strong>Verificación:</strong> Cualquiera puede verificar la prueba sin conocer tus datos privados</li>
                    </ul>
                  </div>
                </div>

                <div className="zkp-actions">
                  <button 
                    onClick={() => copyToClipboard(formatJson(zkpCredentials))}
                    className="copy-btn"
                  >
                    📋 Copiar Prueba ZKP
                  </button>
                  <button 
                    onClick={() => downloadCredential(zkpCredentials, 'zkp-proof.json')}
                    className="download-btn"
                  >
                    💾 Descargar ZKP
                  </button>
                </div>

                <details className="zkp-raw">
                  <summary>Ver ZKP Completa (JSON)</summary>
                  <pre className="json-display">{formatJson(zkpCredentials)}</pre>
                </details>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🚪 Confirmar Cierre de Sesión</h3>
            </div>
            <div className="modal-content">
              <p>¿Estás seguro de que quieres cerrar sesión?</p>
              <p className="warning">Se perderá la sesión actual, pero tus credenciales ZKP permanecerán válidas.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                className="confirm-btn"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;